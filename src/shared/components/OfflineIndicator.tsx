import { useEffect, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import WifiIcon from '@mui/icons-material/Wifi'

/**
 * Shows an indicator when the app is offline
 * Non-intrusive snackbar at the bottom of the screen
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Show "Back Online" message briefly, then hide
      setShowOffline(true)
      setTimeout(() => setShowOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Snackbar
      open={showOffline}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Alert
        severity={isOnline ? 'success' : 'warning'}
        icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
        sx={{ width: '100%' }}
      >
        {isOnline ? 'Back Online' : 'No Internet Connection - Working Offline'}
      </Alert>
    </Snackbar>
  )
}
