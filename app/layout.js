import './globals.css'

export const metadata = {
  title: 'Sefo - AI Kedi Sohbet',
  description: 'GPT-4o ile çalışan akıllı kedi sohbet deneyimi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}