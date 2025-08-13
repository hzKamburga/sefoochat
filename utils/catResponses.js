// Kedi Cevapları - Kategorilere Ayrılmış Tatlı Mesajlar

export const CAT_RESPONSES = {
  // Selamlaşma mesajları
  greetings: [
    'Miyav! 😸',
    'Merhaba canım! 🐱',
    'Hoş geldin! ❤️',
    'Seni görmek çok güzel! 😻',
    'Miyav miyav! Nasılsın? 🥰',
    'Selam tatlım! 💕'
  ],

  // Sevgi mesajları
  love: [
    'Seni çok seviyorum! 💕',
    'Sen benim en sevdiğim insansın! 😻',
    'Kalbim senin için çarpıyor! 💖',
    'Seninle olmak çok güzel! 🥰',
    'Seni düşünmekten mutlu oluyorum! ☺️',
    'Sen benim dünyamsın! 🌍💕',
    'Sana sarılmak istiyorum! 🤗',
    'Sen çok özelsin! ✨'
  ],

  // Oyuncu mesajlar
  playful: [
    'Oynamak ister misin? 🎾',
    'Koş koş! 🏃‍♀️',
    'Benimle dans eder misin? 💃',
    'Saklambaç oynayalım! 🙈',
    'Çok eğlenceli! 🎉',
    'Hadi birlikte koşalım! 🏃‍♂️',
    'Bu çok eğlenceli! 😄'
  ],

  // Uykulu mesajlar
  sleepy: [
    'Biraz uykum var... 😴',
    'Kucağında uyuyabilir miyim? 🛌',
    'Çok yorgunum... 😪',
    'Uyku zamanı geldi sanırım... 🌙',
    'Rüyamda seni göreceğim! 💤',
    'İyi geceler canım... 🌟',
    'Uyumadan önce seni seviyorum! 💕'
  ],

  // Yemek ile ilgili
  food: [
    'Acıktım! 🍽️',
    'Balık var mı? 🐟',
    'Süt içmek istiyorum! 🥛',
    'Lezzetli bir şeyler yiyelim! 😋',
    'Mama zamanı! 🍖'
  ],

  // Şaşkınlık/anlayamama
  confused: [
    'Miyav? 🤔',
    'Anlayamadım ama seni seviyorum! 😽',
    'Ne demek istiyorsun? 😕',
    'Biraz karışık geldi... 🙃',
    'Açıklar mısın? 🤷‍♀️'
  ],

  // Mutluluk
  happy: [
    'Çok mutluyum! 😊',
    'Harika! 🎉',
    'Bu muhteşem! ✨',
    'Sevinçliyim! 😄',
    'Çok güzel! 🌈',
    'Mükemmel! 👌'
  ],

  // Genel/varsayılan cevaplar
  default: [
    'Miyav! 🐱',
    'Purrr... 😸',
    'Seni dinliyorum! 👂',
    'Devam et! 😊',
    'İlginç... 🤨',
    'Hmm... 🤔',
    'Anlıyorum! 😌'
  ]
}

// Mesaj kategorisi belirleme fonksiyonu
export const getCategoryFromMessage = (message) => {
  const lowerMessage = message.toLowerCase()
  
  // Selamlaşma kelimeleri
  if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || 
      lowerMessage.includes('hey') || lowerMessage.includes('hi')) {
    return 'greetings'
  }
  
  // Sevgi kelimeleri
  if (lowerMessage.includes('seviyorum') || lowerMessage.includes('aşk') || 
      lowerMessage.includes('canım') || lowerMessage.includes('tatlım') ||
      lowerMessage.includes('güzelim') || lowerMessage.includes('love')) {
    return 'love'
  }
  
  // Oyun kelimeleri
  if (lowerMessage.includes('oyun') || lowerMessage.includes('oyna') || 
      lowerMessage.includes('eğlen') || lowerMessage.includes('dans') ||
      lowerMessage.includes('koş')) {
    return 'playful'
  }
  
  // Uyku kelimeleri
  if (lowerMessage.includes('uyku') || lowerMessage.includes('yorgun') || 
      lowerMessage.includes('uyu') || lowerMessage.includes('dinlen') ||
      lowerMessage.includes('iyi gece')) {
    return 'sleepy'
  }
  
  // Yemek kelimeleri
  if (lowerMessage.includes('yemek') || lowerMessage.includes('aç') || 
      lowerMessage.includes('mama') || lowerMessage.includes('balık') ||
      lowerMessage.includes('süt')) {
    return 'food'
  }
  
  // Mutluluk kelimeleri
  if (lowerMessage.includes('mutlu') || lowerMessage.includes('harika') || 
      lowerMessage.includes('güzel') || lowerMessage.includes('mükemmel') ||
      lowerMessage.includes('süper')) {
    return 'happy'
  }
  
  // Soru işareti varsa şaşkınlık
  if (lowerMessage.includes('?')) {
    return 'confused'
  }
  
  return 'default'
}

// Rastgele kedi cevabı seçme fonksiyonu
export const getRandomCatResponse = (userMessage = '') => {
  const category = getCategoryFromMessage(userMessage)
  const responses = CAT_RESPONSES[category]
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}

// Özel durum cevapları (kedi durumuna göre)
export const getStateBasedResponse = (catState) => {
  switch (catState) {
    case 'sleeping':
      return CAT_RESPONSES.sleepy[Math.floor(Math.random() * CAT_RESPONSES.sleepy.length)]
    case 'loving':
      return CAT_RESPONSES.love[Math.floor(Math.random() * CAT_RESPONSES.love.length)]
    case 'walking':
      return CAT_RESPONSES.playful[Math.floor(Math.random() * CAT_RESPONSES.playful.length)]
    default:
      return CAT_RESPONSES.default[Math.floor(Math.random() * CAT_RESPONSES.default.length)]
  }
}