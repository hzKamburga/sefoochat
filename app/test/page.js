export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <h1>🐱 Test Sayfası</h1>
        <p>Bu sayfa çalışıyorsa routing doğru!</p>
        <a href="/" style={{ color: 'white' }}>Ana Sayfaya Dön</a>
      </div>
    </div>
  )
}