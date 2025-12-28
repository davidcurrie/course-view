import { useState } from 'react'
import { Course } from '../../../shared/types'
import { useVisitTrackingStore } from '../../../store/visitTrackingStore'

interface SettingsPanelProps {
  courses: Course[]
  onToggleCourse: (courseId: string) => void
  onToggleAll: (visible: boolean) => void
  isGPSTracking: boolean
}

/**
 * Settings panel containing course selection and visit tracking controls
 * Accessible via a settings button to reduce UI clutter on mobile
 */
export function SettingsPanel({
  courses,
  onToggleCourse,
  onToggleAll,
  isGPSTracking,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const allVisible = courses.every(c => c.visible)
  const someVisible = courses.some(c => c.visible)

  // Visit tracking state
  const {
    visitDistanceThreshold,
    isTrackingEnabled,
    visitedControls,
    setVisitDistanceThreshold,
    setTrackingEnabled,
    resetVisitedControls,
  } = useVisitTrackingStore()

  const handleReset = () => {
    if (visitedControls.size === 0) return

    if (confirm(`Reset ${visitedControls.size} visited control${visitedControls.size !== 1 ? 's' : ''}?`)) {
      resetVisitedControls()
    }
  }

  const distanceOptions = [5, 10, 15, 20, 25, 30]

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-forest-600 text-white rounded-lg shadow-lg px-3 py-2 hover:bg-forest-700 transition-colors flex items-center gap-2"
        aria-label="Open settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6" />
          <path d="M4.5 12H1m22 0h-3.5" />
          <path d="M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24" />
          <path d="M18.36 5.64l-4.24 4.24m-4.24 4.24l-4.24 4.24" />
        </svg>
        <span className="text-sm font-medium">Settings</span>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
          />

          {/* Settings Panel - Completely scrollable */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              maxWidth: '384px',
              height: '100%',
              backgroundColor: 'white',
              zIndex: 1000,
              overflowY: 'scroll',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Header */}
            <div style={{ backgroundColor: '#15803d', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                aria-label="Close settings"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1rem' }}>
              {/* Visit Tracking Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Visit Tracking
                </h3>
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
                  {!isGPSTracking && (
                    <div style={{ padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                        Enable GPS tracking to use visit tracking features
                      </p>
                    </div>
                  )}

                  {/* Enable/Disable Toggle */}
                  <div style={{ padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: isTrackingEnabled && isGPSTracking ? '#dcfce7' : '#f3f4f6', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: isTrackingEnabled && isGPSTracking ? '#22c55e' : '#9ca3af'
                          }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: isTrackingEnabled && isGPSTracking ? '#166534' : '#6b7280' }}>
                          {isTrackingEnabled && isGPSTracking ? 'Tracking Active' : 'Tracking Paused'}
                        </span>
                      </div>
                      <button
                        onClick={() => setTrackingEnabled(!isTrackingEnabled)}
                        disabled={!isGPSTracking}
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          height: '1.5rem',
                          width: '2.75rem',
                          alignItems: 'center',
                          borderRadius: '9999px',
                          backgroundColor: isTrackingEnabled && isGPSTracking ? '#16a34a' : '#d1d5db',
                          border: 'none',
                          cursor: isGPSTracking ? 'pointer' : 'not-allowed',
                          opacity: isGPSTracking ? 1 : 0.5,
                          transition: 'background-color 0.2s',
                        }}
                        aria-label="Toggle visit tracking"
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            height: '1rem',
                            width: '1rem',
                            transform: isTrackingEnabled && isGPSTracking ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                            borderRadius: '9999px',
                            backgroundColor: 'white',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </button>
                    </div>
                    {!isTrackingEnabled && isGPSTracking && (
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Enable to mark controls as visited
                      </p>
                    )}
                  </div>

                  {/* Distance Threshold */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="visit-distance" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                      Visit distance
                    </label>
                    <select
                      id="visit-distance"
                      value={visitDistanceThreshold}
                      onChange={(e) => setVisitDistanceThreshold(Number(e.target.value))}
                      disabled={!isTrackingEnabled || !isGPSTracking}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        backgroundColor: (!isTrackingEnabled || !isGPSTracking) ? '#f3f4f6' : 'white',
                        color: (!isTrackingEnabled || !isGPSTracking) ? '#9ca3af' : 'inherit',
                        cursor: (!isTrackingEnabled || !isGPSTracking) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {distanceOptions.map((distance) => (
                        <option key={distance} value={distance}>
                          {distance}m
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Visited Count & Reset */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Visited: <span style={{ fontWeight: 600, color: '#22c55e' }}>{visitedControls.size}</span>
                    </span>
                    <button
                      onClick={handleReset}
                      disabled={visitedControls.size === 0 || !isGPSTracking}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: (visitedControls.size === 0 || !isGPSTracking) ? '#d1d5db' : '#15803d',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: (visitedControls.size === 0 || !isGPSTracking) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Selection Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Courses
                </h3>
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
                  {/* Show/Hide All Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      onClick={() => onToggleAll(true)}
                      disabled={allVisible}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: allVisible ? '#9ca3af' : '#15803d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: allVisible ? 'not-allowed' : 'pointer',
                        opacity: allVisible ? 0.5 : 1,
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => onToggleAll(false)}
                      disabled={!someVisible}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        backgroundColor: !someVisible ? '#9ca3af' : '#4b5563',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: !someVisible ? 'not-allowed' : 'pointer',
                        opacity: !someVisible ? 0.5 : 1,
                      }}
                    >
                      Hide All
                    </button>
                  </div>

                  {/* Course List */}
                  {courses.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No courses available</p>
                  ) : (
                    <div>
                      {courses.map(course => (
                        <label
                          key={course.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={course.visible}
                            onChange={() => onToggleCourse(course.id)}
                            style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                          />
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: course.color,
                              borderRadius: '3px',
                              border: '1px solid rgba(0,0,0,0.1)',
                              flexShrink: 0,
                            }}
                            aria-label={`Course color: ${course.color}`}
                          />
                          <span style={{ fontSize: '0.875rem', flex: 1 }}>{course.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
