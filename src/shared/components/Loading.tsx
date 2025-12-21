interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function Loading({ size = 'md', message }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-forest-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}
