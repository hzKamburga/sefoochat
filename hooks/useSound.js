import { useState, useEffect, useRef, useCallback } from 'react'
import { SOUND_CONFIG } from '../utils/constants'

export const useSound = () => {
  // State'ler
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [volume, setVolume] = useState(SOUND_CONFIG.PURR_VOLUME.SITTING)

  // Ref'ler
  const audioRef = useRef(null)
  const fadeTimeoutRef = useRef(null)

  // Audio nesnesini başlatma
  const initializeAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/purr.mp3')
        audioRef.current.loop = true
        audioRef.current.preload = 'auto'
        
        // Event listener'ları ekle
        audioRef.current.addEventListener('canplaythrough', () => {
          setIsLoading(false)
          setHasError(false)
        })
        
        audioRef.current.addEventListener('error', (e) => {
          console.warn('Ses dosyası yüklenemedi:', e)
          setHasError(true)
          setIsLoading(false)
        })
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
        })
        
        audioRef.current.addEventListener('play', () => {
          setIsPlaying(true)
        })
        
        audioRef.current.addEventListener('pause', () => {
          setIsPlaying(false)
        })
      }
    } catch (error) {
      console.warn('Audio başlatılamadı:', error)
      setHasError(true)
      setIsLoading(false)
    }
  }, [])

  // Ses çalma fonksiyonu
  const playSound = useCallback(async (targetVolume = SOUND_CONFIG.PURR_VOLUME.SITTING) => {
    if (hasError || isMuted || !audioRef.current) return

    try {
      // Tarayıcı autoplay policy'si için user interaction gerekebilir
      audioRef.current.volume = 0
      setVolume(targetVolume)
      
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        await playPromise
        
        // Fade in efekti
        fadeIn(targetVolume)
      }
    } catch (error) {
      console.warn('Ses çalınamadı (muhtemelen autoplay policy):', error)
      // Sessiz modda devam et, hata vermez
    }
  }, [hasError, isMuted])

  // Ses durdurma fonksiyonu
  const stopSound = useCallback(() => {
    if (!audioRef.current || !isPlaying) return

    // Fade out efekti
    fadeOut(() => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    })
  }, [isPlaying])

  // Fade in efekti
  const fadeIn = useCallback((targetVolume) => {
    if (!audioRef.current || hasError) return

    const audio = audioRef.current
    const startVolume = 0
    const duration = SOUND_CONFIG.FADE_DURATION
    const steps = 20
    const stepTime = duration / steps
    const volumeStep = targetVolume / steps

    let currentStep = 0

    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = Math.min(startVolume + (volumeStep * currentStep), targetVolume)
      
      if (audio && !isMuted) {
        audio.volume = newVolume
        setVolume(newVolume)
      }

      if (currentStep >= steps || newVolume >= targetVolume) {
        clearInterval(fadeInterval)
      }
    }, stepTime)

    return fadeInterval
  }, [hasError, isMuted])

  // Fade out efekti
  const fadeOut = useCallback((callback) => {
    if (!audioRef.current || hasError) return

    const audio = audioRef.current
    const startVolume = audio.volume
    const duration = SOUND_CONFIG.FADE_DURATION
    const steps = 20
    const stepTime = duration / steps
    const volumeStep = startVolume / steps

    let currentStep = 0

    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = Math.max(startVolume - (volumeStep * currentStep), 0)
      
      if (audio) {
        audio.volume = newVolume
        setVolume(newVolume)
      }

      if (currentStep >= steps || newVolume <= 0) {
        clearInterval(fadeInterval)
        if (callback) callback()
      }
    }, stepTime)

    return fadeInterval
  }, [hasError])

  // Ses seviyesi ayarlama
  const adjustVolume = useCallback((newVolume) => {
    if (!audioRef.current || hasError || isMuted) return

    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    audioRef.current.volume = clampedVolume
    setVolume(clampedVolume)
  }, [hasError, isMuted])

  // Mute/unmute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMutedState = !prev
      
      if (newMutedState && isPlaying) {
        // Mute edildiğinde sesi durdur
        stopSound()
      } else if (!newMutedState && audioRef.current) {
        // Unmute edildiğinde ses seviyesini geri yükle
        audioRef.current.volume = volume
      }
      
      return newMutedState
    })
  }, [isPlaying, stopSound, volume])

  // Kedi durumuna göre ses çalma
  const playForCatState = useCallback((catState, previousState = null) => {
    if (hasError || isMuted) return

    // Durum değişmemişse işlem yapma
    if (catState === previousState) return

    switch (catState) {
      case 'sitting':
        // Oturma durumunda mırıldanma sesi çal
        if (!isPlaying || volume !== SOUND_CONFIG.PURR_VOLUME.SITTING) {
          playSound(SOUND_CONFIG.PURR_VOLUME.SITTING)
        }
        break
        
      case 'sleeping':
        // Uyku durumunda daha hafif mırıldanma sesi çal
        if (!isPlaying || volume !== SOUND_CONFIG.PURR_VOLUME.SLEEPING) {
          playSound(SOUND_CONFIG.PURR_VOLUME.SLEEPING)
        }
        break
        
      case 'walking':
        // Yürüme durumunda sesi durdur
        if (isPlaying) {
          stopSound()
        }
        break
        
      case 'loving':
        // Sevgi durumunda kısa bir süre sonra sesi durdur (romantik an)
        setTimeout(() => {
          if (isPlaying) {
            stopSound()
          }
        }, 1000)
        break
        
      default:
        // Bilinmeyen durumlarda sesi durdur
        if (isPlaying) {
          stopSound()
        }
        break
    }
  }, [hasError, isMuted, playSound, stopSound, isPlaying, volume])

  // Durum geçişi sırasında ses efektleri
  const handleStateTransition = useCallback((fromState, toState) => {
    if (hasError || isMuted) return

    // Özel geçiş efektleri
    if (fromState === 'walking' && (toState === 'sitting' || toState === 'sleeping')) {
      // Yürümeden oturma/uyku durumuna geçerken kısa bir gecikme ile ses başlat
      setTimeout(() => {
        playForCatState(toState, fromState)
      }, 500)
    } else if (fromState === 'loving' && toState === 'sitting') {
      // Sevgi durumundan oturmaya geçerken yumuşak geçiş
      setTimeout(() => {
        playForCatState(toState, fromState)
      }, 800)
    } else {
      // Normal durum geçişi
      playForCatState(toState, fromState)
    }
  }, [hasError, isMuted, playForCatState])

  // Ses seviyesini kedi durumuna göre otomatik ayarlama
  const adjustVolumeForState = useCallback((catState) => {
    if (hasError || isMuted || !isPlaying) return

    let targetVolume
    switch (catState) {
      case 'sitting':
        targetVolume = SOUND_CONFIG.PURR_VOLUME.SITTING
        break
      case 'sleeping':
        targetVolume = SOUND_CONFIG.PURR_VOLUME.SLEEPING
        break
      default:
        return
    }

    // Yumuşak ses seviyesi geçişi
    if (Math.abs(volume - targetVolume) > 0.05) {
      fadeToVolume(targetVolume)
    }
  }, [hasError, isMuted, isPlaying, volume])

  // Belirli bir ses seviyesine fade etme
  const fadeToVolume = useCallback((targetVolume) => {
    if (!audioRef.current || hasError || isMuted) return

    const audio = audioRef.current
    const startVolume = audio.volume
    const duration = SOUND_CONFIG.FADE_DURATION
    const steps = 20
    const stepTime = duration / steps
    const volumeDiff = targetVolume - startVolume
    const volumeStep = volumeDiff / steps

    let currentStep = 0

    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = startVolume + (volumeStep * currentStep)
      
      if (audio && !isMuted) {
        audio.volume = Math.max(0, Math.min(1, newVolume))
        setVolume(newVolume)
      }

      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        if (audio && !isMuted) {
          audio.volume = targetVolume
          setVolume(targetVolume)
        }
      }
    }, stepTime)

    return fadeInterval
  }, [hasError, isMuted])

  // Tarayıcı ses desteği kontrolü
  const checkAudioSupport = useCallback(() => {
    try {
      const audio = new Audio()
      return !!(audio.canPlayType && audio.canPlayType('audio/mpeg'))
    } catch {
      return false
    }
  }, [])

  // Hook başlatma
  useEffect(() => {
    // Ses desteği kontrolü
    if (!checkAudioSupport()) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    // Audio'yu başlat
    initializeAudio()

    // Cleanup
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplaythrough', () => {})
        audioRef.current.removeEventListener('error', () => {})
        audioRef.current.removeEventListener('ended', () => {})
        audioRef.current.removeEventListener('play', () => {})
        audioRef.current.removeEventListener('pause', () => {})
        audioRef.current = null
      }
    }
  }, [initializeAudio, checkAudioSupport])

  // User interaction için ses başlatma (autoplay policy için)
  const enableAudio = useCallback(async () => {
    if (!audioRef.current || hasError) return

    try {
      // Kısa bir sessiz ses çal (autoplay policy'yi bypass etmek için)
      audioRef.current.volume = 0
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        await playPromise
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.volume = volume
      }
    } catch (error) {
      console.warn('Audio enable edilemedi:', error)
    }
  }, [hasError, volume])

  return {
    // State'ler
    isMuted,
    isPlaying,
    isLoading,
    hasError,
    volume,
    
    // Fonksiyonlar
    playSound,
    stopSound,
    toggleMute,
    adjustVolume,
    playForCatState,
    handleStateTransition,
    adjustVolumeForState,
    fadeToVolume,
    enableAudio,
    
    // Utility
    isSupported: !hasError && checkAudioSupport()
  }
}