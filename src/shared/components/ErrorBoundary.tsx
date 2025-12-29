import { Component, ErrorInfo, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary to catch and display React errors
 * Prevents the entire app from crashing
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    // Reload the page to reset the app state
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Card sx={{ maxWidth: 480, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'error.light',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: 24, color: 'error.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="semibold">
                  Something went wrong
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The application encountered an unexpected error. This has been logged and we'll look into it.
              </Typography>

              {this.state.error && (
                <Box component="details" sx={{ mb: 2 }}>
                  <Typography
                    component="summary"
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
                  >
                    Error details
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                    }}
                  >
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </Box>
                </Box>
              )}

              <Button onClick={this.handleReset} fullWidth variant="primary">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}
