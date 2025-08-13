'use client'

import { useState, useEffect, useRef } from 'react'
import aiService from '../utils/aiService'
import styles from './ChatBox.module.css'

const ChatBox = ({ catState, onCatMoodChange }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const messagesEndRef = useRef(null)

  // AI ile mesaj gönderme
  const sendMessageWithAI = async (userMessage) => {
    try {
      setIsConnected(true)
      const response = await aiService.getCatResponse(userMessage)
      
      if (response.success) {
        // AI cevabını mesajlara ekle
        const catMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'cat',
          timestamp: new Date(),
          aiGenerated: true
        }

        setMessages(prev => [...prev, catMessage])
        
        // Kedi durumunu değiştir
        if (response.mood && window.catMessageTrigger) {
          window.catMessageTrigger(response.mood)
        }
        
        if (onCatMoodChange) {
          onCatMoodChange(response.mood)
        }
        
      } else {
        // Hata durumunda fallback mesaj
        const fallbackMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'cat',
          timestamp: new Date(),
          aiGenerated: false
        }
        setMessages(prev => [...prev, fallbackMessage])
        setIsConnected(false)
      }
      
    } catch (error) {
      console.error('AI mesaj hatası:', error)
      setIsConnected(false)
      
      // Hata durumunda basit cevap
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Miyav! Şu anda biraz kafam karışık... Tekrar dener misin? 😿',
        sender: 'cat',
        timestamp: new Date(),
        aiGenerated: false
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Mesaj gönderme
  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsTyping(true)

    // AI'dan cevap al
    await sendMessageWithAI(messageText)
    setIsTyping(false)
  }

  // Enter tuşu ile gönderme
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  // Otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // İlk mesaj
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: 'Merhaba! Ben Sefo! Senin AI kedinin! 🐱💕 Benimle sohbet etmek ister misin? GPT-4o ile çalışıyorum!',
          sender: 'cat',
          timestamp: new Date(),
          aiGenerated: true
        }])
      }, 1000)
    }
  }, [messages.length])

  // Mesaj geçmişini temizleme fonksiyonu
  const clearChat = () => {
    setMessages([])
    aiService.clearHistory()
  }

  // AI'dan otomatik durum değişimi iste
  const requestAIMoodChange = async () => {
    try {
      const response = await aiService.getCatResponse("Nasıl hissediyorsun şu anda?")
      
      if (response.success && response.mood) {
        if (window.catMessageTrigger) {
          window.catMessageTrigger(response.mood)
        }
        
        if (onCatMoodChange) {
          onCatMoodChange(response.mood)
        }
      }
    } catch (error) {
      console.log('Otomatik durum değişimi hatası:', error)
    }
  }

  // Global fonksiyon olarak kaydet
  useEffect(() => {
    window.requestAIMoodChange = requestAIMoodChange
  }, [requestAIMoodChange])

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <span className={styles.catAvatar}>🤖🐱</span>
          <div>
            <h3>Sefo (AI Kedi)</h3>
            <p>
              {isConnected ? 'GPT-4o ile çalışıyor' : 'Bağlantı sorunu'}
              {' • '}
              {catState === 'sitting' && 'Oturuyor'}
              {catState === 'walking' && 'Yürüyor'}
              {catState === 'sleeping' && 'Uyuyor'}
              {catState === 'loving' && 'Seni seviyor'}
            </p>
          </div>
        </div>
        <div className={styles.statusIndicator}>
          <div className={`${styles.statusDot} ${isConnected ? styles.online : styles.offline}`}></div>
          <span>{isConnected ? 'AI Aktif' : 'Offline'}</span>
          <button 
            onClick={clearChat}
            className={styles.clearButton}
            title="Sohbeti temizle"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.messagesArea}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`${styles.message} ${styles[message.sender]}`}
          >
            {message.sender === 'cat' && (
              <div className={styles.messageAvatar}>🐱</div>
            )}
            <div className={styles.messageContent}>
              <div className={`${styles.messageText} ${message.aiGenerated ? styles.aiMessage : ''}`}>
                {message.text}
                {message.aiGenerated && <span className={styles.aiIndicator}>🤖</span>}
              </div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.cat}`}>
            <div className={styles.messageAvatar}>🐱</div>
            <div className={styles.typingIndicator}>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Sefo'ya bir şeyler yaz... (AI ile konuşuyor)"
            className={styles.messageInput}
            disabled={isTyping}
          />
          <button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={styles.sendButton}
          >
            📤
          </button>
        </div>
        <div className={styles.inputHint}>
          🤖 Sefo GPT-4o ile çalışıyor ve mesaj geçmişini hatırlıyor!
        </div>
      </div>
    </div>
  )
}

export default ChatBox