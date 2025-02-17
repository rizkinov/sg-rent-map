export function LoadingState() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
} 