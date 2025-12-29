import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import EventIcon from '@mui/icons-material/Event'
import ShareIcon from '@mui/icons-material/Share'
import { Button } from '../../../shared/components'
import { Event } from '../../../shared/types'
import { canUseWebShare, shareEvent, exportEventAsZip } from '../../events/services/eventSharer'

interface EventCardProps {
  event: Event
  onDelete: (eventId: string) => void
}

/**
 * Display a single event card with name, date, and actions
 */
export function EventCard({ event, onDelete }: EventCardProps) {
  const navigate = useNavigate()
  const [isSharing, setIsSharing] = useState(false)

  const handleView = () => {
    navigate(`/map/${event.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${event.name}"? This cannot be undone.`)) {
      onDelete(event.id)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Try Web Share API first (mobile iOS/Android)
    if (canUseWebShare()) {
      try {
        setIsSharing(true)
        await shareEvent(event.id)
        // Successfully shared via native dialog
        console.log('Event shared successfully via Web Share API')
        setIsSharing(false)
        return
      } catch (error: any) {
        setIsSharing(false)

        if (error.name === 'AbortError') {
          // User cancelled share dialog - not an error
          console.log('User cancelled share')
          return
        }

        // Share failed - fall back to export
        console.warn('Web Share API failed, falling back to export:', error)
      }
    }

    // Fallback: Export files for manual sharing
    await handleExport(e)
  }

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      setIsSharing(true)

      console.log('Starting export for event:', event.id)

      // Export as single ZIP file
      const zipBlob = await exportEventAsZip(event.id)
      console.log('ZIP file created successfully, size:', (zipBlob.size / 1024).toFixed(1), 'KB')

      // Create filename from event name
      const filename = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.forestteam.zip`

      // Download the ZIP file
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('ZIP file downloaded successfully:', filename)

      alert(
        `✅ Event exported!\n\n` +
        `Downloaded: ${filename}\n` +
        `Size: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB\n\n` +
        `Share this file with others. Recipients should use "Import Shared Event" to add it to their app.`
      )
    } catch (error: any) {
      console.error('Export failed:', error)
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      })
      alert(
        `Failed to export event.\n\n` +
        `Error: ${error?.message || 'Unknown error'}\n\n` +
        `Please check the browser console (F12) for details.`
      )
    } finally {
      setIsSharing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left side: Event info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" noWrap>
                {event.name}
              </Typography>
              {event.isDemo && (
                <Chip label="Demo" color="info" size="small" />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formatDate(event.date)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.courses.length} course{event.courses.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Right side: Action buttons */}
          <Stack spacing={1} sx={{ minWidth: 120 }}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleView}
            >
              View Map
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={isSharing}
              onClick={handleShare}
              startIcon={isSharing ? <CircularProgress size={16} /> : <ShareIcon />}
              title={canUseWebShare() ? 'Share event files via native share dialog' : 'Export event files for sharing'}
            >
              {isSharing ? 'Preparing...' : 'Share'}
            </Button>
            {!event.isDemo && (
              <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
