// Kedi Durumları
export const CAT_STATES = {
  SITTING: 'sitting',
  WALKING: 'walking',
  SLEEPING: 'sleeping',
  LOVING: 'loving'
}

// Kedi Görselleri
export const CAT_IMAGES = {
  [CAT_STATES.SITTING]: '/kediler/kedioturuyor.png',
  [CAT_STATES.WALKING]: ['/kediler/kediyuruyor1.png', '/kediler/kediyuruyor2.png'],
  [CAT_STATES.SLEEPING]: '/kediler/kediuyuyor.png',
  [CAT_STATES.LOVING]: '/kediler/seniseviyor.png'
}

// Durum Geçiş Makinesi
export const STATE_TRANSITIONS = {
  [CAT_STATES.SITTING]: [CAT_STATES.WALKING, CAT_STATES.SLEEPING, CAT_STATES.LOVING],
  [CAT_STATES.WALKING]: [CAT_STATES.SITTING, CAT_STATES.LOVING],
  [CAT_STATES.SLEEPING]: [CAT_STATES.SITTING, CAT_STATES.LOVING],
  [CAT_STATES.LOVING]: [CAT_STATES.SITTING, CAT_STATES.WALKING]
}

// Timing Konfigürasyonu
export const TIMING_CONFIG = {
  MIN_STATE_TIME: 3000, // 3 saniye
  MAX_STATE_TIME: 8000, // 8 saniye
  WALKING_SPEED: 50, // px/saniye
  TRANSITION_DURATION: 500, // ms
  WALKING_ANIMATION_SPEED: 800, // ms (kediyuruyor1 <-> kediyuruyor2)
  RESPONSE_DELAY: 1000 // Kedi cevap verme gecikmesi
}

// Yön Sabitleri
export const DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right'
}

// Ses Konfigürasyonu
export const SOUND_CONFIG = {
  PURR_VOLUME: {
    SITTING: 0.3,
    SLEEPING: 0.2
  },
  FADE_DURATION: 300 // ms
}

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
}

// Animasyon Sabitleri
export const ANIMATION_CONFIG = {
  BOUNCE_EASING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  FAST_EASING: 'ease-out'
}

// Utility Fonksiyonları
export const getRandomStateTransition = (currentState) => {
  const possibleStates = STATE_TRANSITIONS[currentState]
  const randomIndex = Math.floor(Math.random() * possibleStates.length)
  return possibleStates[randomIndex]
}

export const getRandomTime = (min = TIMING_CONFIG.MIN_STATE_TIME, max = TIMING_CONFIG.MAX_STATE_TIME) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomDirection = () => {
  return Math.random() > 0.5 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT
}

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}