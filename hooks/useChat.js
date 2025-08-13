import { useState, useCallback, useRef, useEffect } from 'react'
import { getRandomCatResponse, getStateBasedResponse } from '../utils/catResponses'
import { TIMING_CONFIG } from '../utils/constants'
import { 
  createMessageObject, 
  formatMessage, 
  validateMessage as validateMessageUtil,
  filterMessages,
  getMessageStats,
  exportMessages,
  importMessages
} from '../utils/messageUtils'

export const useChat = (catState = 'sitting') => {
  // State'ler
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Ref'ler
  const messageIdCounter = useRef(0)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Mesaj ID oluşturma
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1
    return `msg_${Date.now()}_${messageIdCounter.current}`
  }, [])

  // Mesaj objesi oluşturma (utility kullanarak)
  const createMessage = useCallback((text, sender = 'user') => {
    try {
      return createMessageObject(text, sender)
    } catch (error) {
      console.warn('Mesaj oluşturma hatası:', error)
      return null
    }
  }, [])

  // Mesaj ekleme (formatlanmış)
  const addMessage = useCallback((message) => {
    if (!message) return
    
    const formattedMessage = formatMessage(message)
    if (formattedMessage && formattedMessage.isValid) {
      setMessages(prevMessages => [...prevMessages, formattedMessage])
    }
  }, [])

  // Kullanıcı mesajı gönderme
  const sendUserMessage = useCallback((text) => {
    if (!text || !text.trim()) return

    const userMessage = createMessage(text, 'user')
    addMessage(userMessage)
    
    // Input'u temizle
    setInputValue('')
    
    // Kedi cevabını gecikme ile gönder
    setIsTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendCatResponse(text)
      setIsTyping(false)
    }, TIMING_CONFIG.RESPONSE_DELAY)

    return userMessage
  }, [createMessage, addMessage])

  // Kedi cevabı gönderme
  const sendCatResponse = useCallback((userMessageText = '') => {
    let catResponseText
    
    // Kedi durumuna göre özel cevap ver
    if (Math.random() < 0.3) { // %30 ihtimalle durum bazlı cevap
      catResponseText = getStateBasedResponse(catState)
    } else {
      // Normal cevap seçimi
      catResponseText = getRandomCatResponse(userMessageText)
    }
    
    const catMessage = createMessage(catResponseText, 'cat')
    addMessage(catMessage)
    
    return catMessage
  }, [catState, createMessage, addMessage])

  // Otomatik kedi mesajı (kullanıcı etkileşimi olmadan)
  const sendAutoCatMessage = useCallback(() => {
    const autoMessage = getStateBasedResponse(catState)
    const catMessage = createMessage(autoMessage, 'cat')
    addMessage(catMessage)
    return catMessage
  }, [catState, createMessage, addMessage])

  // Input değeri güncelleme
  const updateInputValue = useCallback((value) => {
    setInputValue(value)
  }, [])

  // Mesajları temizleme
  const clearMessages = useCallback(() => {
    setMessages([])
    messageIdCounter.current = 0
  }, [])

  // Mesajları okundu olarak işaretleme
  const markMessagesAsRead = useCallback(() => {
    setMessages(prevMessages => 
      prevMessages.map(msg => ({ ...msg, isRead: true }))
    )
  }, [])

  // Son mesaja scroll etme
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  // Mesaj geçmişini localStorage'a kaydetme
  const saveMessagesToStorage = useCallback(() => {
    try {
      const messagesToSave = messages.slice(-50) // Son 50 mesajı sakla
      localStorage.setItem('kedi-chat-messages', JSON.stringify(messagesToSave))
    } catch (error) {
      console.warn('Mesajlar localStorage\'a kaydedilemedi:', error)
    }
  }, [messages])

  // Mesaj geçmişini localStorage'dan yükleme
  const loadMessagesFromStorage = useCallback(() => {
    try {
      const savedMessages = localStorage.getItem('kedi-chat-messages')
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
        messageIdCounter.current = parsedMessages.length
      }
    } catch (error) {
      console.warn('Mesajlar localStorage\'dan yüklenemedi:', error)
    }
  }, [])

  // Mesaj validasyonu (utility kullanarak)
  const validateMessage = useCallback((text) => {
    const validation = validateMessageUtil(text)
    return validation.isValid
  }, [])

  // Güvenli mesaj gönderme (validasyon ile)
  const sendMessageSafely = useCallback((text) => {
    if (!validateMessage(text)) {
      console.warn('Geçersiz mesaj:', text)
      return null
    }
    
    return sendUserMessage(text)
  }, [validateMessage, sendUserMessage])

  // Form submit handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      sendMessageSafely(inputValue)
    }
  }, [inputValue, sendMessageSafely])

  // Enter tuşu handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  // Mesaj sayısı sınırlama (performans için)
  useEffect(() => {
    if (messages.length > 100) {
      setMessages(prevMessages => prevMessages.slice(-80)) // Son 80 mesajı tut
    }
  }, [messages.length])

  // Yeni mesaj geldiğinde scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Mesajları otomatik kaydetme
  useEffect(() => {
    if (messages.length > 0) {
      const saveTimeout = setTimeout(saveMessagesToStorage, 1000)
      return () => clearTimeout(saveTimeout)
    }
  }, [messages, saveMessagesToStorage])

  // Component mount'ta mesajları yükle
  useEffect(() => {
    loadMessagesFromStorage()
  }, [loadMessagesFromStorage])

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // İstatistikler (utility kullanarak)
  const stats = getMessageStats(messages)

  return {
    // State'ler
    messages,
    isTyping,
    inputValue,
    
    // Fonksiyonlar
    sendUserMessage,
    sendCatResponse,
    sendAutoCatMessage,
    sendMessageSafely,
    updateInputValue,
    clearMessages,
    markMessagesAsRead,
    scrollToBottom,
    handleSubmit,
    handleKeyPress,
    
    // Storage fonksiyonları
    saveMessagesToStorage,
    loadMessagesFromStorage,
    
    // Utility fonksiyonları
    filterMessages: (filters) => filterMessages(messages, filters),
    exportMessages: () => exportMessages(messages),
    importMessages: (jsonString) => {
      const importedMessages = importMessages(jsonString)
      setMessages(importedMessages)
      return importedMessages.length
    },
    
    // Utility
    stats,
    messagesEndRef,
    validateMessage
  }
}