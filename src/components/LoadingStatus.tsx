interface LoadingStatusProps {
  loaded: number
  total: number
}

export function LoadingStatus({ loaded, total }: LoadingStatusProps) {
  const percentage = Math.round((loaded / total) * 100)
  
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4">
      <div className="text-sm font-medium">
        Loading properties: {loaded} of {total}
      </div>
      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
} 