'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './Cat.module.css'

const Cat = ({ onStateChange }) => {
    const [catState, setCatState] = useState('sitting')
    const [position, setPosition] = useState({ x: 50, y: 50 })
    const [direction, setDirection] = useState('right')
    const [walkingFrame, setWalkingFrame] = useState(0) // 0 = kediyuruyor1, 1 = kediyuruyor2
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [aiControlled, setAiControlled] = useState(false)

    const stateTimerRef = useRef(null)
    const walkingTimerRef = useRef(null)
    const animationFrameRef = useRef(null)

    // Kedi görselleri mapping
    const catImages = {
        sitting: '/kediler/kedioturuyor.png',
        walking: ['/kediler/kediyuruyor1.png', '/kediler/kediyuruyor2.png'],
        sleeping: '/kediler/kediuyuyor.png',
        loving: '/kediler/seniseviyor.png'
    }

    // Mevcut görseli al
    const getCurrentImage = () => {
        if (catState === 'walking') {
            return catImages.walking[walkingFrame]
        }
        return catImages[catState]
    }

    // Yürüme animasyonu (frame değiştirme)
    const startWalkingAnimation = () => {
        if (animationFrameRef.current) {
            clearInterval(animationFrameRef.current)
        }

        animationFrameRef.current = setInterval(() => {
            setWalkingFrame(prev => prev === 0 ? 1 : 0)
        }, 400) // 400ms'de bir frame değiştir
    }

    const stopWalkingAnimation = () => {
        if (animationFrameRef.current) {
            clearInterval(animationFrameRef.current)
            animationFrameRef.current = null
        }
        setWalkingFrame(0)
    }

    // Durum değiştirme
    const changeState = (newState) => {
        if (newState === catState) return

        setIsTransitioning(true)

        setTimeout(() => {
            setCatState(newState)
            setIsTransitioning(false)

            if (newState === 'walking') {
                startWalkingAnimation()
                startMoving()
            } else {
                stopWalkingAnimation()
                stopMoving()
            }

            // Parent'a bildir
            if (onStateChange) {
                onStateChange(newState)
            }
        }, 200)
    }

    // Hareket başlatma
    const startMoving = () => {
        let moveInterval

        const move = () => {
            setPosition(prev => {
                let newX = prev.x
                const speed = 1.5 // Hareket hızını artırdım

                if (direction === 'right') {
                    newX += speed
                    if (newX >= 80) {
                        setDirection('left')
                    }
                } else {
                    newX -= speed
                    if (newX <= 20) {
                        setDirection('right')
                    }
                }

                return { ...prev, x: Math.max(20, Math.min(80, newX)) }
            })
        }

        // Hareketi başlat
        moveInterval = setInterval(move, 100) // 100ms'de bir hareket et

        // Interval'ı ref'e kaydet ki durdurabilelim
        if (walkingTimerRef.current) {
            clearInterval(walkingTimerRef.current)
        }
        walkingTimerRef.current = moveInterval

        // 4-6 saniye sonra hareketi durdur
        setTimeout(() => {
            if (walkingTimerRef.current) {
                clearInterval(walkingTimerRef.current)
                walkingTimerRef.current = null
            }
            if (!aiControlled) {
                changeState('sitting')
            }
        }, 4000 + Math.random() * 2000)
    }

    const stopMoving = () => {
        if (walkingTimerRef.current) {
            clearInterval(walkingTimerRef.current)
            walkingTimerRef.current = null
        }
    }

    // AI otomatik durum değişimi
    const scheduleNextStateChange = () => {
        if (stateTimerRef.current) {
            clearTimeout(stateTimerRef.current)
        }

        const delay = 6000 + Math.random() * 6000 // 6-12 saniye arası
        stateTimerRef.current = setTimeout(() => {
            // AI'dan otomatik durum değişimi iste
            if (window.requestAIMoodChange) {
                window.requestAIMoodChange()
            }
            scheduleNextStateChange()
        }, delay)
    }

    // Kedi'ye tıklama (devre dışı)
    const handleCatClick = () => {
        // Tıklama tepkisi kaldırıldı - AI kontrol ediyor
    }

    // AI tarafından kontrol edilen durum değişimi
    const handleAIMoodChange = (newMood) => {
        setAiControlled(true)
        changeState(newMood)

        // AI kontrolü sürekli aktif - rastgele değişimi engelle
        setTimeout(() => {
            setAiControlled(false)
        }, 8000) // 8 saniye AI kontrolü
    }

    // Mesaj bazlı durum değişimi (dışarıdan çağrılacak)
    const handleMessageTrigger = (mood) => {
        if (mood) {
            handleAIMoodChange(mood)
        }
    }

    // Component mount
    useEffect(() => {
        scheduleNextStateChange()

        return () => {
            if (stateTimerRef.current) {
                clearTimeout(stateTimerRef.current)
            }
            if (walkingTimerRef.current) {
                clearInterval(walkingTimerRef.current)
            }
            if (animationFrameRef.current) {
                clearInterval(animationFrameRef.current)
            }
        }
    }, [])

    // Yürüme durumu değiştiğinde
    useEffect(() => {
        if (catState === 'walking') {
            startWalkingAnimation()
        } else {
            stopWalkingAnimation()
        }
    }, [catState])

    // handleMessageTrigger'ı global olarak erişilebilir yap
    useEffect(() => {
        window.catMessageTrigger = handleMessageTrigger
    }, [handleMessageTrigger])

    return (
        <div className={styles.catContainer}>
            <div
                className={`${styles.cat} ${styles[catState]} ${styles[direction]} ${isTransitioning ? styles.transitioning : ''}`}
                style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`
                }}
                onClick={handleCatClick}
            >
                <Image
                    src={getCurrentImage()}
                    alt={`Sefo ${catState} durumunda`}
                    width={250}
                    height={250}
                    priority={catState === 'sitting'}
                    className={styles.catImage}
                    draggable={false}
                />
            </div>

            {/* Durum göstergesi */}
            <div className={styles.statusDisplay}>
                <div className={styles.statusText}>
                    {catState === 'sitting' && '🪑 Oturuyor'}
                    {catState === 'walking' && '🚶 Yürüyor'}
                    {catState === 'sleeping' && '😴 Uyuyor'}
                    {catState === 'loving' && '💕 Seni seviyor'}
                </div>
            </div>
        </div>
    )
}

export default Cat