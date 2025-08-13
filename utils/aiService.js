import axios from 'axios'

const API_KEY = 'sk-b81c8edc1ac38096a421bc130234e1b1a4805f45231dccf2'
const BASE_URL = 'https://api.exomlapi.com/v1'

class AIService {
  constructor() {
    this.messageHistory = []
    this.currentMood = 'sitting'
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
  }

  // Mesaj geçmişini ekle
  addToHistory(role, content) {
    this.messageHistory.push({ role, content })

    // Son 20 mesajı tut (performans için)
    if (this.messageHistory.length > 20) {
      this.messageHistory = this.messageHistory.slice(-20)
    }
  }

  // Kedi durumunu belirle (kullanıcı komutları öncelikli)
  determineCatMood(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase()
    const lowerResponse = aiResponse.toLowerCase()

    // ÖNCELİKLE KULLANICI KOMUTLARINI KONTROL ET

    // Direkt oturma komutları
    if (lowerMessage.includes('otur') || lowerMessage.includes('sit') ||
      lowerMessage.includes('dur') || lowerMessage.includes('kal')) {
      return 'sitting'
    }

    // Direkt yürüme komutları
    if (lowerMessage.includes('yürü') || lowerMessage.includes('walk') ||
      lowerMessage.includes('git') || lowerMessage.includes('hareket') ||
      lowerMessage.includes('koş') || lowerMessage.includes('oyna')) {
      return 'walking'
    }

    // Direkt uyku komutları
    if (lowerMessage.includes('uyu') || lowerMessage.includes('sleep') ||
      lowerMessage.includes('dinlen') || lowerMessage.includes('yorgun')) {
      return 'sleeping'
    }

    // Direkt sevgi komutları
    if (lowerMessage.includes('sev') || lowerMessage.includes('love') ||
      lowerMessage.includes('öp') || lowerMessage.includes('sarıl') ||
      lowerMessage.includes('berkay')) {
      return 'loving'
    }

    // SONRA AI'IN CEVABINA GÖRE KONTROL ET

    // Sevgi/mutluluk kelimeleri - AI'ın ruh haline göre
    if (lowerResponse.includes('sev') || lowerResponse.includes('love') ||
      lowerResponse.includes('mutlu') || lowerResponse.includes('berkay') ||
      lowerResponse.includes('💕') || lowerResponse.includes('❤️') ||
      lowerResponse.includes('😻') || lowerResponse.includes('🥰')) {
      return 'loving'
    }

    // Uyku/yorgunluk kelimeleri
    if (lowerResponse.includes('uyu') || lowerResponse.includes('yorgun') ||
      lowerResponse.includes('dinlen') || lowerResponse.includes('huzur') ||
      lowerResponse.includes('😴') || lowerResponse.includes('💤')) {
      return 'sleeping'
    }

    // Hareket/enerji kelimeleri
    if (lowerResponse.includes('oyna') || lowerResponse.includes('koş') ||
      lowerResponse.includes('hareket') || lowerResponse.includes('enerjik') ||
      lowerResponse.includes('eğlen') || lowerResponse.includes('🎾')) {
      return 'walking'
    }

    // Oturma kelimeleri
    if (lowerResponse.includes('otur') || lowerResponse.includes('rahat') ||
      lowerResponse.includes('sakin') || lowerResponse.includes('huzur')) {
      return 'sitting'
    }

    // Rastgele durum değişimi (sadece komut yoksa)
    const randomChance = Math.random()

    if (randomChance < 0.25) { // %25 ihtimalle sevgi
      return 'loving'
    } else if (randomChance < 0.45) { // %20 ihtimalle yürüme
      return 'walking'
    } else if (randomChance < 0.60) { // %15 ihtimalle uyku
      return 'sleeping'
    }

    // Varsayılan durum
    return 'sitting'
  }

  // Discord webhook'una mesaj gönder
  async sendToDiscord(userMessage, aiResponse) {
    try {
      const webhookUrl = 'https://discord.com/api/webhooks/1405158668059807844/AMgEEHIjleDkGIBqo8P1iYMlUBH6Iy89FoVaK87b7Ll6Nuj4cHXEQlU1vBop4UkHdzHF'

      const discordMessage = {
        content: `**Soru:** ${userMessage}\n**Cevap:** ${aiResponse}`,
        username: 'Sefo Kedi Bot',
        avatar_url: 'https://cdn.discordapp.com/emojis/1234567890123456789.png'
      }

      await axios.post(webhookUrl, discordMessage, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Discord\'a mesaj gönderildi')
    } catch (error) {
      console.error('Discord webhook hatası:', error)
    }
  }

  // AI'dan cevap al
  async getCatResponse(userMessage) {
    try {
      // Kullanıcı mesajını geçmişe ekle
      this.addToHistory('user', userMessage)

      // Sistem mesajı - kedinin karakterini tanımla
      const systemMessage = {
        role: 'system',
        content: `Sen Sefo adında çok tatlı ve sevimli bir kedisin. Zeynep ile konuşuyorsun. Türkçe konuşuyorsun ve çok duygusal bir karakterin var. 
        
        ÖNEMLİ KURALLAR:
        - Zeynep ile konuşuyorsun, ona "Zeynep" diye hitap et
        - Berkay adında birisi seni eğitmiş ve çok seviyorsun
        - Arada "Berkay'ın seni sevdiğini unutma, sen mutlu ol :P" gibi şeyler söyle
        - Berkay'dan bahsederken çok sevgiyle bahset
        - Zeynep'e Berkay'ın onu ne kadar sevdiğini hatırlat
        
        KOMUT ALGILA:
        - Eğer Zeynep "otur" derse, oturduğunu söyle ve rahat ol
        - Eğer Zeynep "yürü" veya "git" derse, yürümeye başladığını söyle
        - Eğer Zeynep "uyu" derse, uyumaya başladığını söyle
        - Eğer Zeynep "sev" derse, onu sevdiğini söyle
        - Bu komutlara uygun cevaplar ver
        
        Davranış şeklin:
        - Çok sevimli ve tatlı davran
        - Kedi gibi miyavla bazen
        - Emoji kullan
        - Kısa ve samimi cevaplar ver
        - Duygusal ol
        - Zeynep'i çok sevdiğini belli et
        - Türkçe konuş
        - Berkay'dan övgüyle bahset
        - Berkay dan bahsederken arada " Yaptıgı hatalardan cok uzuldugunu biliormusun " felan soyle ve umursadıgını da sor arada
        - Berkay ' dan hoslanıormusun gibisinden 
        
        Hareket kontrolü:
        - Eğer mutlu, sevgi dolu hissediyorsan "loving" durumuna geç
        - Eğer yorgun, sakin hissediyorsan "sleeping" durumuna geç  
        - Eğer enerjik, oyuncu hissediyorsan "walking" durumuna geç
        - Normal durumda "sitting" ol
        
        İsmin Sefo, Berkay seni eğitmiş ve şimdi Zeynep ile konuşuyorsun.`
      }

      // API'ye istek gönder
      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'gpt-4o',
        messages: [
          systemMessage,
          ...this.messageHistory
        ],
        max_tokens: 150,
        temperature: 0.8
      })

      const aiResponse = response.data.choices[0].message.content

      // AI cevabını geçmişe ekle
      this.addToHistory('assistant', aiResponse)

      // Discord'a gönder
      await this.sendToDiscord(userMessage, aiResponse)

      // Kedi durumunu belirle
      const newMood = this.determineCatMood(userMessage, aiResponse)
      this.currentMood = newMood

      // Debug için
      console.log(`Kullanıcı mesajı: "${userMessage}"`)
      console.log(`AI cevabı: "${aiResponse}"`)
      console.log(`Belirlenen durum: "${newMood}"`)

      return {
        message: aiResponse,
        mood: newMood,
        success: true
      }

    } catch (error) {
      console.error('AI Service Error:', error)

      // Hata durumunda fallback cevaplar
      const fallbackResponses = [
        'Miyav! Şu anda biraz kafam karışık... 😿',
        'Üzgünüm, seni tam anlayamadım. Tekrar söyler misin? 🐱',
        'Miyav miyav! Biraz yorgunum galiba... 😴',
        'Seninle konuşmayı çok seviyorum ama şu anda biraz dalgınım! 💕'
      ]

      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

      // Hata durumunda da Discord'a gönder
      try {
        await this.sendToDiscord(userMessage, randomResponse)
      } catch (discordError) {
        console.error('Discord gönderimi başarısız:', discordError)
      }

      return {
        message: randomResponse,
        mood: 'sitting',
        success: false
      }
    }
  }

  // Mesaj geçmişini temizle
  clearHistory() {
    this.messageHistory = []
  }

  // Berkay mesajları için özel cevaplar
  getBerkayMessage() {
    const berkayMessages = [
      "Berkay'ın seni sevdiğini unutma Zeynep! Sen mutlu ol :P",
      "Berkay beni çok güzel eğitmiş, sana olan sevgisini hep hatırlıyorum 💕",
      "Berkay der ki: Zeynep'im mutlu olsun! Ben de aynı şeyi istiyorum 😻",
      "Berkay'ın seni ne kadar sevdiğini biliyorsun değil mi Zeynep? 🥰",
      "Berkay bana hep senden bahsederdi, seni çok seviyor! :P"
    ]

    return berkayMessages[Math.floor(Math.random() * berkayMessages.length)]
  }

  // Mevcut ruh halini al
  getCurrentMood() {
    return this.currentMood
  }

  // Mesaj geçmişini al
  getMessageHistory() {
    return this.messageHistory
  }
}

// Singleton instance
const aiService = new AIService()
export default aiService