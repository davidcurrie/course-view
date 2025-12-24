import { Outlet } from 'react-router-dom'
import { OfflineIndicator, InstallPrompt } from '../shared/components'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <OfflineIndicator />
      <InstallPrompt />
    </div>
  )
}
