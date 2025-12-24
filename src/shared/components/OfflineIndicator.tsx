import { useEffect, useState } from 'react'

/**
 * Shows an indicator when the app is offline
 * Non-intrusive banner at the bottom of the screen
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
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

  // Don't show anything if online
  if (isOnline && !showOffline) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        showOffline ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-yellow-500 text-white px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            {isOnline ? 'Back Online' : 'No Internet Connection - Working Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
