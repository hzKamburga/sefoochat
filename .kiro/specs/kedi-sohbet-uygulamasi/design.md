# Tasarım Belgesi

## Genel Bakış

Kedi sohbet uygulaması, Next.js 14 kullanılarak geliştirilecek olan single-page application'dır. Uygulama, kullanıcının sanal bir kedi ile etkileşime girebileceği, kedinin otomatik animasyonlar sergileyeceği ve ses efektleri ile desteklenecek romantik bir deneyim sunacaktır.

## Mimari

### Genel Mimari Yaklaşımı
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Styling**: CSS Modules + CSS-in-JS (styled-jsx)
- **Animasyon**: CSS Transitions + Framer Motion (opsiyonel)
- **Ses Yönetimi**: HTML5 Audio API
- **Görsel Optimizasyonu**: next/image

### Klasör Yapısı
```
/
├── app/
│   ├── page.js (Ana sayfa)
│   ├── layout.js (Root layout)
│   └── globals.css (Global stiller)
├── components/
│   ├── Cat.jsx (Kedi komponenti)
│   ├── ChatBox.jsx (Sohbet kutusu)
│   └── SoundController.jsx (Ses kontrolü)
├── public/
│   ├── kediler/ (Kedi görselleri)
│   └── sounds/ (Ses dosyaları)
├── hooks/
│   ├── useCatBehavior.js (Kedi davranış hook'u)
│   ├── useChat.js (Sohbet hook'u)
│   └── useSound.js (Ses hook'u)
└── utils/
    ├── catResponses.js (Kedi cevapları)
    └── constants.js (Sabitler)
```

## Bileşenler ve Arayüzler

### 1. Ana Sayfa (app/page.js)
```javascript
// Ana layout ve bileşenlerin orchestration'ı
- Cat bileşenini render eder
- ChatBox bileşenini render eder  
- Global state management
- Responsive layout yönetimi
```

### 2. Cat Bileşeni (components/Cat.jsx)
```javascript
// Kedi görsellerini ve animasyonlarını yönetir
Props: {
  position: { x: number, y: number },
  currentState: 'sitting' | 'walking' | 'sleeping' | 'loving',
  direction: 'left' | 'right'
}

State: {
  currentImage: string,
  animationClass: string,
  isTransitioning: boolean
}

Methods:
- updateCatState()
- handleWalkingAnimation()
- handleStateTransition()
```

### 3. ChatBox Bileşeni (components/ChatBox.jsx)
```javascript
// Sohbet arayüzünü yönetir
Props: {
  messages: Array<{id, text, sender, timestamp}>,
  onSendMessage: function
}

State: {
  inputValue: string,
  isTyping: boolean
}

Methods:
- handleMessageSend()
- scrollToBottom()
- formatMessage()
```

### 4. SoundController Bileşeni (components/SoundController.jsx)
```javascript
// Ses kontrollerini yönetir
Props: {
  catState: string,
  isMuted: boolean,
  onToggleMute: function
}

Methods:
- playPurrSound()
- stopPurrSound()
- adjustVolume()
```

## Veri Modelleri

### Cat State Model
```javascript
const CatState = {
  SITTING: 'sitting',
  WALKING: 'walking', 
  SLEEPING: 'sleeping',
  LOVING: 'loving'
}

const CatBehavior = {
  state: CatState,
  position: { x: number, y: number },
  direction: 'left' | 'right',
  lastStateChange: timestamp,
  isMoving: boolean
}
```

### Message Model
```javascript
const Message = {
  id: string,
  text: string,
  sender: 'user' | 'cat',
  timestamp: Date,
  isRead: boolean
}
```

### Sound Model
```javascript
const SoundConfig = {
  purrSound: {
    src: '/sounds/purr.mp3',
    volume: 0.3,
    loop: true
  },
  isMuted: boolean,
  currentlyPlaying: string | null
}
```

## Hata Yönetimi

### Görsel Yükleme Hataları
- Fallback görselleri tanımlanacak
- Loading state'leri implement edilecek
- Error boundary'ler kullanılacak

### Ses Yükleme Hataları
- Tarayıcı ses desteği kontrolü
- Autoplay policy handling
- Graceful degradation (sessiz mod)

### State Yönetimi Hataları
- Invalid state transitions'ları önleme
- State corruption'a karşı validation
- Recovery mechanisms

## Test Stratejisi

### Unit Tests
- Cat behavior hook testleri
- Message formatting utility testleri
- Sound controller logic testleri

### Integration Tests
- Cat ve ChatBox bileşen etkileşimi
- Sound ve Cat state synchronization
- Responsive behavior testleri

### E2E Tests
- Kullanıcı mesaj gönderme flow'u
- Kedi animasyon döngüsü
- Ses açma/kapama functionality

## Performans Optimizasyonları

### Görsel Optimizasyonu
- next/image ile lazy loading
- WebP format desteği
- Responsive image sizing

### Animasyon Optimizasyonu
- CSS transform kullanımı (GPU acceleration)
- will-change property'si
- Animation frame throttling

### Memory Management
- Audio object cleanup
- Event listener cleanup
- State cleanup on unmount

## Teknik Detaylar

### Kedi Animasyon Sistemi
```javascript
// Durum geçiş makinesi
const stateTransitions = {
  sitting: ['walking', 'sleeping', 'loving'],
  walking: ['sitting', 'loving'],
  sleeping: ['sitting', 'loving'],
  loving: ['sitting', 'walking']
}

// Timing konfigürasyonu
const timingConfig = {
  minStateTime: 3000, // 3 saniye
  maxStateTime: 8000, // 8 saniye
  walkingSpeed: 50, // px/second
  transitionDuration: 500 // ms
}
```

### Sohbet Sistemi
```javascript
// Kedi cevapları kategorileri
const catResponses = {
  greetings: ['Miyav! 😸', 'Merhaba canım! 🐱', 'Hoş geldin! ❤️'],
  love: ['Seni çok seviyorum! 💕', 'Sen benim en sevdiğim insansın! 😻'],
  playful: ['Oynamak ister misin? 🎾', 'Koş koş! 🏃‍♀️'],
  sleepy: ['Biraz uykum var... 😴', 'Kucağında uyuyabilir miyim? 🛌'],
  default: ['Miyav? 🤔', 'Anlayamadım ama seni seviyorum! 😽']
}
```

### Responsive Tasarım Breakpoints
```css
/* Mobile First Approach */
.container {
  /* Mobile: 320px - 768px */
  padding: 1rem;
}

@media (min-width: 768px) {
  /* Tablet: 768px - 1024px */
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop: 1024px+ */
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Renk Paleti
```css
:root {
  /* Ana renkler */
  --primary-blue: #6B73FF;
  --secondary-blue: #9B59B6;
  --light-blue: #E8F4FD;
  
  /* Kedi renkleri */
  --cat-primary: #FF6B6B;
  --cat-secondary: #4ECDC4;
  
  /* Sohbet renkleri */
  --user-bubble: #FFFFFF;
  --cat-bubble: #FFE5E5;
  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  
  /* Gradient'ler */
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bubble-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
```

## Güvenlik Considerations

### XSS Koruması
- Kullanıcı input'larının sanitization'ı
- dangerouslySetInnerHTML kullanımından kaçınma

### Content Security Policy
- Ses dosyaları için uygun CSP headers
- External resource loading restrictions

### Privacy
- Kullanıcı mesajlarının local storage'da tutulması
- Kişisel veri toplamaması