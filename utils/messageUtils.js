// Mesaj Formatlaması ve Validasyon Utility'leri

// Mesaj sanitization (XSS koruması)
export const sanitizeMessage = (text) => {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Mesaj validasyonu
export const validateMessage = (text) => {
  const errors = []
  
  if (!text || typeof text !== 'string') {
    errors.push('Mesaj metni gerekli')
    return { isValid: false, errors }
  }
  
  const trimmedText = text.trim()
  
  if (trimmedText.length === 0) {
    errors.push('Boş mesaj gönderilemez')
  }
  
  if (trimmedText.length > 500) {
    errors.push('Mesaj çok uzun (maksimum 500 karakter)')
  }
  
  if (trimmedText.length < 1) {
    errors.push('Mesaj çok kısa')
  }
  
  // Spam kontrolü - aynı karakterin çok tekrarı
  const repeatedCharPattern = /(.)\1{10,}/
  if (repeatedCharPattern.test(trimmedText)) {
    errors.push('Çok fazla tekrarlanan karakter')
  }
  
  // URL spam kontrolü
  const urlPattern = /(https?:\/\/[^\s]+)/gi
  const urls = trimmedText.match(urlPattern)
  if (urls && urls.length > 2) {
    errors.push('Çok fazla link')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedText: sanitizeMessage(trimmedText)
  }
}

// Mesaj formatlaması
export const formatMessage = (messageObj) => {
  if (!messageObj) return null
  
  const validation = validateMessage(messageObj.text)
  
  return {
    ...messageObj,
    text: validation.sanitizedText,
    formattedText: formatMessageText(validation.sanitizedText),
    timestamp: formatTimestamp(messageObj.timestamp),
    isValid: validation.isValid,
    errors: validation.errors
  }
}

// Mesaj metnini formatla (emoji, link vb. için)
export const formatMessageText = (text) => {
  if (!text) return ''
  
  // Emoji kısayollarını gerçek emoji'lere çevir
  const emojiMap = {
    ':)': '😊',
    ':-)': '😊',
    ':(': '😢',
    ':-(': '😢',
    ':D': '😄',
    ':-D': '😄',
    ';)': '😉',
    ';-)': '😉',
    ':P': '😛',
    ':-P': '😛',
    '<3': '❤️',
    '</3': '💔',
    ':heart:': '❤️',
    ':cat:': '🐱',
    ':love:': '💕'
  }
  
  let formattedText = text
  
  // Emoji değişimlerini yap
  Object.entries(emojiMap).forEach(([shortcut, emoji]) => {
    const regex = new RegExp(escapeRegExp(shortcut), 'gi')
    formattedText = formattedText.replace(regex, emoji)
  })
  
  return formattedText
}

// Timestamp formatlaması
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Şimdi'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`
  } else if (diffInMinutes < 1440) { // 24 saat
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} saat önce`
  } else {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Mesaj ID oluşturma
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Mesaj objesi oluşturma
export const createMessageObject = (text, sender = 'user', additionalData = {}) => {
  const validation = validateMessage(text)
  
  if (!validation.isValid) {
    throw new Error(`Geçersiz mesaj: ${validation.errors.join(', ')}`)
  }
  
  return {
    id: generateMessageId(),
    text: validation.sanitizedText,
    formattedText: formatMessageText(validation.sanitizedText),
    sender,
    timestamp: new Date(),
    isRead: false,
    isValid: true,
    ...additionalData
  }
}

// Mesaj listesini filtrele
export const filterMessages = (messages, filters = {}) => {
  if (!Array.isArray(messages)) return []
  
  let filteredMessages = [...messages]
  
  // Gönderen filtresi
  if (filters.sender) {
    filteredMessages = filteredMessages.filter(msg => msg.sender === filters.sender)
  }
  
  // Tarih filtresi
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) >= fromDate)
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) <= toDate)
  }
  
  // Metin arama
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase()
    filteredMessages = filteredMessages.filter(msg => 
      msg.text.toLowerCase().includes(searchLower)
    )
  }
  
  // Okunmamış mesajlar
  if (filters.unreadOnly) {
    filteredMessages = filteredMessages.filter(msg => !msg.isRead)
  }
  
  return filteredMessages
}

// Mesaj istatistikleri
export const getMessageStats = (messages) => {
  if (!Array.isArray(messages)) return {}
  
  const stats = {
    total: messages.length,
    user: messages.filter(msg => msg.sender === 'user').length,
    cat: messages.filter(msg => msg.sender === 'cat').length,
    unread: messages.filter(msg => !msg.isRead).length,
    today: 0,
    thisWeek: 0
  }
  
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000))
  
  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp)
    if (msgDate >= todayStart) {
      stats.today++
    }
    if (msgDate >= weekStart) {
      stats.thisWeek++
    }
  })
  
  return stats
}

// Regex escape utility
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Mesaj export/import
export const exportMessages = (messages) => {
  try {
    const exportData = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Mesaj export hatası:', error)
    return null
  }
}

export const importMessages = (jsonString) => {
  try {
    const importData = JSON.parse(jsonString)
    
    if (!importData.messages || !Array.isArray(importData.messages)) {
      throw new Error('Geçersiz mesaj formatı')
    }
    
    return importData.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  } catch (error) {
    console.error('Mesaj import hatası:', error)
    return []
  }
}