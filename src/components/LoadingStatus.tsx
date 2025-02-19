interface LoadingStatusProps {
  loaded: number
  total: number
}

export function LoadingStatus({ loaded, total }: LoadingStatusProps) {
  const percentage = Math.round((loaded / total) * 100)
  
  return (
    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <h3 className="font-medium">Loading Properties</h3>
          <div className="text-sm text-muted-foreground">
            {loaded} of {total} properties
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 