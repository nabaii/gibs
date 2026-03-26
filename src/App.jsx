import { useState, useEffect } from 'react'
import Presentation from './components/Presentation'
import WebsiteSection from './components/WebsiteSection'
import PitchEnding from './components/PitchEnding'

// mode: 'presentation' | 'website' | 'ending'
export default function App() {
  const [mode, setMode] = useState('presentation')

  useEffect(() => {
    if (mode === 'presentation') {
      document.body.style.overflow = 'hidden'
      document.body.style.cursor = 'pointer'
    } else if (mode === 'website') {
      document.body.style.overflow = 'auto'
      document.body.style.cursor = 'default'
    } else if (mode === 'ending') {
      document.body.style.overflow = 'hidden'
      document.body.style.cursor = 'pointer'
    }
  }, [mode])

  return (
    <>
      {mode === 'presentation' && (
        <Presentation onEnterWebsite={() => setMode('website')} />
      )}
      {mode === 'website' && (
        <WebsiteSection onShowEnding={() => setMode('ending')} />
      )}
      {mode === 'ending' && (
        <PitchEnding onReset={() => setMode('presentation')} />
      )}
    </>
  )
}
