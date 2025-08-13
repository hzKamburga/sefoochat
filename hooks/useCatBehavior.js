import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  CAT_STATES, 
  DIRECTIONS, 
  getRandomStateTransition, 
  getRandomTime, 
  getRandomDirection,
  TIMING_CONFIG,
  clamp
} from '../utils/constants'

export const useCatBehavior = () => {
  // Kedi durumu state'leri
  const [catState, setCatState] = useState(CAT_STATES.SITTING)
  const [position, setPosition] = useState({ x: 50, y: 50 }) // Yüzde cinsinden
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [walkingFrame, setWalkingFrame] = useState(0) // 0 veya 1 (kediyuruyor1/kediyuruyor2)

  // Ref'ler
  const stateTimerRef = useRef(null)
  const walkingTimerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastStateChangeRef = useRef(Date.now())

  // Yürüme animasyonu başlatma
  const startWalkingAnimation = useCallback(() => {
    if (walkingTimerRef.current) {
      clearInterval(walkingTimerRef.current)
    }

    walkingTimerRef.current = setInterval(() => {
      setWalkingFrame(prev => prev === 0 ? 1 : 0)
    }, TIMING_CONFIG.WALKING_ANIMATION_SPEED)
  }, [])

  // Yürüme animasyonu durdurma
  const stopWalkingAnimation = useCallback(() => {
    if (walkingTimerRef.current) {
      clearInterval(walkingTimerRef.current)
      walkingTimerRef.current = null
    }
    setWalkingFrame(0)
  }, [])

  // Durum değiştirme fonksiyonu
  const changeState = useCallback((newState) => {
    if (newState === catState) return

    setIsTransitioning(true)
    
    // Kısa bir geçiş animasyonu sonrası yeni duruma geç
    setTimeout(() => {
      setCatState(newState)
      lastStateChangeRef.current = Date.now()
      setIsTransitioning(false)
      
      // Eğer yürüme durumuna geçiyorsa, hareket animasyonunu başlat
      if (newState === CAT_STATES.WALKING) {
        startWalkingAnimation()
      } else {
        stopWalkingAnimation()
      }
    }, TIMING_CONFIG.TRANSITION_DURATION / 2)
  }, [catState, startWalkingAnimation, stopWalkingAnimation])

  // Durum timer'ını ayarlama
  const scheduleNextStateChange = useCallback(() => {
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current)
    }

    const delay = getRandomTime()
    stateTimerRef.current = setTimeout(() => {
      const newState = getRandomStateTransition(catState)
      changeState(newState)
      scheduleNextStateChange() // Bir sonraki değişimi planla
    }, delay)
  }, [catState, changeState])

  // Manuel durum değiştirme (kullanıcı etkileşimi için)
  const forceStateChange = useCallback((newState) => {
    changeState(newState)
    scheduleNextStateChange() // Timer'ı yeniden başlat
  }, [changeState, scheduleNextStateChange])

  // Pozisyon güncelleme (yürüme sırasında)
  const updatePosition = useCallback(() => {
    if (catState !== CAT_STATES.WALKING) return

    setPosition(prevPosition => {
      const speed = TIMING_CONFIG.WALKING_SPEED / 60 // 60 FPS için normalize et
      const directionMultiplier = direction === DIRECTIONS.RIGHT ? 1 : -1
      const newX = prevPosition.x + (speed * directionMultiplier * 0.1) // Yüzde cinsinden

      // Ekran sınırlarını kontrol et (10% - 90% arası - daha güvenli sınırlar)
      const clampedX = clamp(newX, 10, 90)
      
      // Eğer sınıra ulaştıysa yönü değiştir
      if ((newX <= 10 && direction === DIRECTIONS.LEFT) || 
          (newX >= 90 && direction === DIRECTIONS.RIGHT)) {
        setDirection(prev => prev === DIRECTIONS.LEFT ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT)
      }

      return {
        ...prevPosition,
        x: clampedX
      }
    })
  }, [catState, direction])

  // Ana animasyon döngüsü
  const animationLoop = useCallback(() => {
    updatePosition()
    animationFrameRef.current = requestAnimationFrame(animationLoop)
  }, [updatePosition])

  // Ekran boyutu değişikliklerini handle etme
  const handleResize = useCallback(() => {
    // Pozisyonu ekran sınırları içinde tut
    setPosition(prevPosition => ({
      ...prevPosition,
      x: clamp(prevPosition.x, 10, 90),
      y: clamp(prevPosition.y, 20, 80)
    }))
  }, [])

  // Pozisyonu manuel olarak ayarlama
  const setManualPosition = useCallback((newPosition) => {
    setPosition(newPosition)
  }, [])

  // Kedi'yi belirli bir noktaya yönlendirme (kullanıcı tıklaması için)
  const moveToPosition = useCallback((targetX, targetY) => {
    const currentPos = position
    
    // Yönü hedef pozisyona göre ayarla
    if (targetX > currentPos.x) {
      setDirection(DIRECTIONS.RIGHT)
    } else if (targetX < currentPos.x) {
      setDirection(DIRECTIONS.LEFT)
    }
    
    // Yürüme durumuna geç ve hedefe doğru hareket et
    if (catState !== CAT_STATES.WALKING) {
      forceStateChange(CAT_STATES.WALKING)
    }
    
    // Hedef pozisyonu ayarla (animasyonlu geçiş için)
    const clampedX = clamp(targetX, 10, 90)
    const clampedY = clamp(targetY, 20, 80)
    
    setPosition({ x: clampedX, y: clampedY })
  }, [position, catState, forceStateChange])

  // Rastgele pozisyona hareket etme
  const moveToRandomPosition = useCallback(() => {
    const randomX = Math.random() * 80 + 10 // 10% - 90% arası
    const randomY = Math.random() * 60 + 20 // 20% - 80% arası
    moveToPosition(randomX, randomY)
  }, [moveToPosition])

  // Hook başlatma
  useEffect(() => {
    // İlk durum değişimini planla
    scheduleNextStateChange()
    
    // Animasyon döngüsünü başlat
    animationFrameRef.current = requestAnimationFrame(animationLoop)

    // Resize event listener ekle
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    // Cleanup
    return () => {
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current)
      }
      if (walkingTimerRef.current) {
        clearInterval(walkingTimerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [scheduleNextStateChange, animationLoop, handleResize])

  // Yürüme durumu değiştiğinde animasyonu kontrol et
  useEffect(() => {
    if (catState === CAT_STATES.WALKING) {
      startWalkingAnimation()
    } else {
      stopWalkingAnimation()
    }
  }, [catState, startWalkingAnimation, stopWalkingAnimation])

  return {
    // State'ler
    catState,
    position,
    direction,
    isTransitioning,
    walkingFrame,
    
    // Fonksiyonlar
    forceStateChange,
    setManualPosition,
    moveToPosition,
    moveToRandomPosition,
    
    // Utility
    timeSinceLastChange: Date.now() - lastStateChangeRef.current
  }
}