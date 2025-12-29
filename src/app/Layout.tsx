import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { OfflineIndicator, InstallPrompt } from '../shared/components'

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Outlet />
      <OfflineIndicator />
      <InstallPrompt />
    </Box>
  )
}
