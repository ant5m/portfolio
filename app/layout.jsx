import { ColorSchemeProvider } from '../src/useColorScheme'
import '../src/App.css'

export const metadata = {
  title: "Ant's World - Portfolio",
  description: "Ant's personal portfolio website",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ColorSchemeProvider>
          {children}
        </ColorSchemeProvider>
      </body>
    </html>
  )
} 