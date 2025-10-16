"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { SPRINGS, SPRING_PRESETS, type SpringName } from "@/lib/springs"

export default function SpringAnimationsDemo() {
  const [activeSpring, setActiveSpring] = React.useState<SpringName>("land")
  const [isVisible, setIsVisible] = React.useState(true)
  const [dragPosition, setDragPosition] = React.useState({ x: 0, y: 0 })
  const [progress, setProgress] = React.useState(0)

  // Auto-increment progress for growth demo
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const springOptions: { name: SpringName; description: string }[] = [
    { name: "land", description: "Settling motion" },
    { name: "drag", description: "Responsive drag" },
    { name: "ripple", description: "Quick & bouncy" },
    { name: "magnetism", description: "Snap to position" },
    { name: "cluster", description: "Grouped motion" },
    { name: "growth", description: "Organic expansion" },
  ]

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Spring Physics Animations</h1>
        <p className="text-muted-foreground text-lg">
          Explore the 6 spring configurations for natural, physics-based motion
        </p>
      </div>

      {/* Spring Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Spring Configuration</CardTitle>
          <CardDescription>
            Each spring has unique physics properties for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {springOptions.map((option) => (
              <Button
                key={option.name}
                variant={activeSpring === option.name ? "default" : "outline"}
                onClick={() => setActiveSpring(option.name)}
                className="flex flex-col items-start gap-1 h-auto py-3"
              >
                <span className="font-semibold">{option.name}</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Spring Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            SPRINGS.{activeSpring} Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md p-4 font-mono text-sm">
            <pre>
              {JSON.stringify(SPRINGS[activeSpring], null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demos */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Demo 1: Fade/Scale Animation */}
        <Card>
          <CardHeader>
            <CardTitle>Appear/Disappear Demo</CardTitle>
            <CardDescription>
              Toggle visibility with {activeSpring} spring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setIsVisible(!isVisible)}>
              {isVisible ? "Hide" : "Show"} Element
            </Button>

            <div className="bg-muted flex h-48 items-center justify-center rounded-md">
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ ...SPRINGS[activeSpring] }}
                  className="bg-primary text-primary-foreground rounded-lg p-8 text-center font-semibold"
                >
                  Animated Element
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo 2: Drag Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Drag Interaction Demo</CardTitle>
            <CardDescription>
              Drag the element (uses {activeSpring} spring)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setDragPosition({ x: 0, y: 0 })}
              variant="outline"
            >
              Reset Position
            </Button>

            <div className="bg-muted relative h-48 overflow-hidden rounded-md">
              <motion.div
                drag
                dragConstraints={{ left: 0, right: 200, top: 0, bottom: 100 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  setDragPosition({ x: info.point.x, y: info.point.y })
                }}
                transition={{ ...SPRINGS[activeSpring] }}
                className="bg-primary text-primary-foreground absolute left-8 top-8 cursor-grab rounded-lg p-4 font-semibold active:cursor-grabbing"
                whileDrag={{ scale: 1.1 }}
              >
                Drag me!
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Demo 3: Scale on Hover/Tap */}
        <Card>
          <CardHeader>
            <CardTitle>Button Interaction Demo</CardTitle>
            <CardDescription>
              Hover and click to feel the {activeSpring} spring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted flex h-48 items-center justify-center rounded-md">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ ...SPRINGS[activeSpring] }}
                className="bg-primary text-primary-foreground rounded-lg px-8 py-4 text-lg font-semibold"
              >
                Interactive Button
              </motion.button>
            </div>
          </CardContent>
        </Card>

        {/* Demo 4: Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Animation Demo</CardTitle>
            <CardDescription>
              Progress bar with {activeSpring} spring (auto-animating)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground text-sm">
              Progress: {progress}%
            </div>

            <div className="bg-muted h-12 overflow-hidden rounded-md">
              <motion.div
                className="bg-primary h-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ ...SPRINGS[activeSpring] }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spring Presets Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Spring Presets</CardTitle>
          <CardDescription>
            Pre-configured animation patterns for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(SPRING_PRESETS) as Array<keyof typeof SPRING_PRESETS>).map(
              (presetName) => {
                const preset = SPRING_PRESETS[presetName]
                return (
                  <motion.div
                    key={presetName}
                    {...preset}
                    className="bg-muted border-border flex h-32 items-center justify-center rounded-md border p-4 text-center font-semibold"
                  >
                    {presetName}
                  </motion.div>
                )
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use {activeSpring} spring in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md p-4 font-mono text-sm">
            <pre>{`import { motion } from "motion/react"
import { SPRINGS } from "@/lib/springs"

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRINGS.${activeSpring} }}
    >
      Content
    </motion.div>
  )
}`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Performance Note */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">
            💡 Performance Tip
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <p>
            Spring animations only animate <code>transform</code> and{" "}
            <code>opacity</code> properties, which are GPU-accelerated and won't
            cause layout reflows. This ensures smooth 60fps animations even on
            lower-end devices.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
