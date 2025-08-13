'use client'

import { useState } from 'react'
import Cat from '../components/Cat'
import ChatBox from '../components/ChatBox'
import styles from './page.module.css'

export default function Home() {
  const [catState, setCatState] = useState('sitting')

  const handleCatStateChange = (newState) => {
    setCatState(newState)
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          🤖 Sefo - AI Kedi Sohbet 💕
        </h1>
        <p className={styles.subtitle}>
          GPT-4o ile çalışan akıllı kedi deneyimi
        </p>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Cat Area */}
        <section className={styles.catSection}>
          <Cat onStateChange={handleCatStateChange} />
        </section>

        {/* Chat Area */}
        <section className={styles.chatSection}>
          <ChatBox 
            catState={catState} 
            onCatMoodChange={handleCatStateChange}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>❤️ Sefo - GPT-4o ile güçlendirilmiş AI kedi deneyimi</p>
      </footer>
    </main>
  )
}