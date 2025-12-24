interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

/**
 * Skeleton loading placeholder
 * Provides visual feedback while content is loading
 */
export function Skeleton({
  className = '',
  width,
  height,
  variant = 'rectangular'
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200'

  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  }[variant]

  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  )
}

/**
 * Skeleton card for loading event cards
 */
export function SkeletonEventCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton height="24px" width="60%" className="mb-2" />
          <Skeleton height="16px" width="40%" className="mb-3" />
          <Skeleton height="16px" width="30%" />
        </div>
        <div className="flex flex-col gap-2" style={{ width: '100px' }}>
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </div>
      </div>
    </div>
  )
}
