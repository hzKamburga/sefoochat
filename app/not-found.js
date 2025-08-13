import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐱 404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sayfa Bulunamadı</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Sefo burada değil! Ana sayfaya dönelim.
      </p>
      <Link 
        href="/" 
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '25px',
          textDecoration: 'none',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        🏠 Ana Sayfaya Dön
      </Link>
    </div>
  )
}