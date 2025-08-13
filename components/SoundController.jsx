'use client'

import { useEffect, useState } from 'react'
import { useSound } from '../hooks/useSound'
import styles from './SoundController.module.css'

const SoundController = ({ catState, onSoundStateChange }) => {
  // Sound hook'unu kullan
  const {
    isMuted,
    isPlaying,
    isLoading,
    hasError,
    volume,
    toggleMute,
    playForCatState,
    handleStateTransition,
    adjustVolumeForState,
    enableAudio,
    isSupported
  } = useSound()

  // Local state
  const [previousCatState, setPreviousCatState] = useState(catState)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

  // Kedi durumu değiştiğinde ses kontrolü
  useEffect(() => {
    if (catState !== previousCatState && userInteracted) {
      handleStateTransition(previousCatState, catState)
      setPreviousCatState(catState)
    }
  }, [catState, previousCatState, handleStateTransition, userInteracted])

  // Parent'a ses durumu değişikliklerini bildir
  useEffect(() => {
    if (onSoundStateChange) {
      onSoundStateChange({
        isMuted,
        isPlaying,
        volume,
        hasError,
        isSupported
      })
    }
  }, [isMuted, isPlaying, volume, hasError, isSupported, onSoundStateChange])

  // Mute/unmute toggle handler
  const handleToggleMute = async () => {
    // İlk kullanıcı etkileşimi - audio'yu etkinleştir
    if (!userInteracted) {
      await enableAudio()
      setUserInteracted(true)
    }
    
    toggleMute()
  }

  // Volume slider toggle
  const handleVolumeToggle = () => {
    setShowVolumeSlider(!showVolumeSlider)
  }

  // Ses seviyesi değiştirme
  const handleVolumeChange = (newVolume) => {
    adjustVolumeForState(catState)
  }

  // Manuel ses çalma (test için)
  const handlePlaySound = async () => {
    if (!userInteracted) {
      await enableAudio()
      setUserInteracted(true)
    }
    
    playForCatState(catState)
  }

  // Ses durumu ikonu
  const getSoundIcon = () => {
    if (hasError || !isSupported) return '🔇'
    if (isMuted) return '🔇'
    if (isPlaying) return '🔊'
    return '🔉'
  }

  // Ses durumu metni
  const getSoundStatusText = () => {
    if (hasError) return 'Ses hatası'
    if (!isSupported) return 'Ses desteklenmiyor'
    if (isLoading) return 'Ses yükleniyor...'
    if (isMuted) return 'Ses kapalı'
    if (isPlaying) return 'Ses açık'
    return 'Ses hazır'
  }

  // Kedi durumuna göre ses açıklaması
  const getCatStateDescription = () => {
    switch (catState) {
      case 'sitting':
        return 'Oturduğunda mırıldanır'
      case 'sleeping':
        return 'Uyurken hafif mırıldanır'
      case 'walking':
        return 'Yürürken sessiz'
      case 'loving':
        return 'Sevgi anında sessiz'
      default:
        return 'Ses durumu bilinmiyor'
    }
  }

  return (
    <div className={styles.soundController}>
      {/* Ana Ses Kontrolü */}
      <div className={styles.mainControls}>
        <button
          className={`${styles.soundButton} ${isMuted ? styles['soundButton--muted'] : ''} ${isPlaying ? styles['soundButton--playing'] : ''}`}
          onClick={handleToggleMute}
          disabled={hasError || !isSupported}
          aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
          title={getSoundStatusText()}
        >
          <span className={styles.soundIcon}>
            {getSoundIcon()}
          </span>
          
          {/* Ses dalgaları animasyonu */}
          {isPlaying && !isMuted && (
            <div className={styles.soundWaves}>
              <span className={styles.wave}></span>
              <span className={styles.wave}></span>
              <span className={styles.wave}></span>
            </div>
          )}
        </button>

        {/* Ses Durumu Metni */}
        <div className={styles.soundStatus}>
          <div className={styles.statusText}>
            {getSoundStatusText()}
          </div>
          <div className={styles.statusDescription}>
            {getCatStateDescription()}
          </div>
        </div>
      </div>

      {/* Gelişmiş Kontroller */}
      <div className={styles.advancedControls}>
        {/* Volume Slider Toggle */}
        {isSupported && !hasError && (
          <button
            className={styles.volumeToggle}
            onClick={handleVolumeToggle}
            aria-label="Ses seviyesi ayarları"
          >
            🎚️
          </button>
        )}

        {/* Test Button (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            className={styles.testButton}
            onClick={handlePlaySound}
            disabled={hasError || !isSupported}
            aria-label="Ses testi"
          >
            🎵
          </button>
        )}
      </div>

      {/* Volume Slider */}
      {showVolumeSlider && isSupported && !hasError && (
        <div className={styles.volumeSlider}>
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel}>
              Ses Seviyesi: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Ses seviyesi"
            />
          </div>
        </div>
      )}

      {/* Hata Durumu */}
      {hasError && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>
            Ses çalınamıyor. Tarayıcınız ses dosyalarını desteklemiyor olabilir.
          </span>
        </div>
      )}

      {/* Bilgi Mesajı */}
      {!userInteracted && isSupported && !hasError && (
        <div className={styles.infoMessage}>
          <span className={styles.infoIcon}>ℹ️</span>
          <span className={styles.infoText}>
            Sesi etkinleştirmek için ses butonuna tıklayın
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingMessage}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>
            Ses dosyası yükleniyor...
          </span>
        </div>
      )}
    </div>
  )
}

export default SoundController