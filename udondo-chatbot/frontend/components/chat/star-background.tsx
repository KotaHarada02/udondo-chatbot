"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

export function StarBackground() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generatedStars: Star[] = []
    for (let i = 0; i < 50; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      })
    }
    setStars(generatedStars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-card/90" />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-foreground/60 star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Nebula effect */}
      <div
        className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.2 230 / 0.3) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, oklch(0.75 0.18 45 / 0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
