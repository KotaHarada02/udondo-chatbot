"use client"

interface WaveformVisualizerProps {
  isActive: boolean
}

export function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            isActive ? "bg-accent wave-bar" : "bg-muted-foreground/30 h-2"
          }`}
          style={{
            height: isActive ? `${20 + Math.random() * 20}px` : "8px",
          }}
        />
      ))}
    </div>
  )
}
