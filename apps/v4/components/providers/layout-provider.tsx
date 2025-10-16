"use client"

import * as React from "react"

type Layout = "default" | "fixed" | "fluid"

interface LayoutContextValue {
  layout: Layout
  setLayout: (layout: Layout) => void
}

const LayoutContext = React.createContext<LayoutContextValue | undefined>(
  undefined
)

interface LayoutProviderProps {
  children: React.ReactNode
  defaultLayout?: Layout
}

/**
 * Layout Provider Component
 *
 * Provides layout context for managing different layout modes across the application.
 * Supports 'default', 'fixed', and 'fluid' layouts.
 *
 * @example
 * ```tsx
 * import { LayoutProvider } from "@/components/providers/layout-provider"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <LayoutProvider defaultLayout="default">
 *       {children}
 *     </LayoutProvider>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using the layout in components
 * import { useLayout } from "@/components/providers/layout-provider"
 *
 * export function LayoutSwitcher() {
 *   const { layout, setLayout } = useLayout()
 *
 *   return (
 *     <select value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
 *       <option value="default">Default</option>
 *       <option value="fixed">Fixed</option>
 *       <option value="fluid">Fluid</option>
 *     </select>
 *   )
 * }
 * ```
 */
export function LayoutProvider({
  children,
  defaultLayout = "default",
}: LayoutProviderProps) {
  const [layout, setLayout] = React.useState<Layout>(defaultLayout)

  // Sync layout with document class
  React.useEffect(() => {
    const root = document.documentElement

    // Remove all layout classes
    root.classList.remove("layout-default", "layout-fixed", "layout-fluid")

    // Add current layout class
    root.classList.add(`layout-${layout}`)
  }, [layout])

  const value = React.useMemo(
    () => ({
      layout,
      setLayout,
    }),
    [layout]
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

/**
 * Hook to access layout context
 *
 * @throws {Error} If used outside of LayoutProvider
 * @returns {LayoutContextValue} The layout context value
 */
export function useLayout() {
  const context = React.useContext(LayoutContext)

  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }

  return context
}
