import 'leaflet'

declare module 'leaflet' {
  interface DivIconOptions {
    html?: string
    className?: string
  }
} 