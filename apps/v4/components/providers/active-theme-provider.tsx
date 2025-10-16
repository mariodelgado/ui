"use client"

import * as React from "react"
import { useTheme } from "next-themes"

interface ActiveTheme {
  activeTheme: string | undefined
  isLight: boolean
  isDark: boolean
  isSystem: boolean
}

const ActiveThemeContext = React.createContext<ActiveTheme | undefined>(
  undefined
)

interface ActiveThemeProviderProps {
  children: React.ReactNode
}

/**
 * Active Theme Provider Component
 *
 * Provides computed theme information including whether the active theme
 * is light, dark, or system. Handles the resolved theme from next-themes.
 *
 * Must be used inside ThemeProvider from next-themes.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from "@/components/providers/theme-provider"
 * import { ActiveThemeProvider } from "@/components/providers/active-theme-provider"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ThemeProvider>
 *       <ActiveThemeProvider>
 *         {children}
 *       </ActiveThemeProvider>
 *     </ThemeProvider>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using active theme in components
 * import { useActiveTheme } from "@/components/providers/active-theme-provider"
 *
 * export function ThemeIndicator() {
 *   const { activeTheme, isLight, isDark } = useActiveTheme()
 *
 *   return (
 *     <div>
 *       <p>Current theme: {activeTheme}</p>
 *       <p>Is light mode: {isLight ? "Yes" : "No"}</p>
 *       <p>Is dark mode: {isDark ? "Yes" : "No"}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function ActiveThemeProvider({ children }: ActiveThemeProviderProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = mounted ? resolvedTheme : undefined
  const isLight = activeTheme === "light"
  const isDark = activeTheme === "dark"
  const isSystem = theme === "system"

  const value = React.useMemo(
    () => ({
      activeTheme,
      isLight,
      isDark,
      isSystem,
    }),
    [activeTheme, isLight, isDark, isSystem]
  )

  return (
    <ActiveThemeContext.Provider value={value}>
      {children}
    </ActiveThemeContext.Provider>
  )
}

/**
 * Hook to access active theme information
 *
 * @throws {Error} If used outside of ActiveThemeProvider
 * @returns {ActiveTheme} The active theme information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { activeTheme, isLight, isDark } = useActiveTheme()
 *
 *   return (
 *     <div className={isDark ? "dark-specific-class" : "light-specific-class"}>
 *       Current theme: {activeTheme}
 *     </div>
 *   )
 * }
 * ```
 */
export function useActiveTheme() {
  const context = React.useContext(ActiveThemeContext)

  if (context === undefined) {
    throw new Error(
      "useActiveTheme must be used within an ActiveThemeProvider"
    )
  }

  return context
}
