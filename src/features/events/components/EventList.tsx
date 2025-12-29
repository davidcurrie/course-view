import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { Event } from '../../../shared/types'
import { EventCard } from './EventCard'

interface EventListProps {
  events: Event[]
  onDelete: (eventId: string) => void
}

/**
 * Display a list of events sorted by date (most recent first)
 */
export function EventList({ events, onDelete }: EventListProps) {
  if (events.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 12,
        }}
      >
        <DescriptionOutlinedIcon
          sx={{
            fontSize: 48,
            color: 'text.disabled',
            mb: 2,
          }}
        />
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          No events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get started by uploading your first event.
        </Typography>
      </Box>
    )
  }

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <Stack spacing={2}>
      {sortedEvents.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  )
}
