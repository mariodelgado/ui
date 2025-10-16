/**
 * Framer Motion spring configurations for consistent animation feel
 * across the application.
 *
 * These physics-based spring configurations provide natural-feeling animations
 * that respond to user interactions and state changes.
 *
 * @see https://www.framer.com/motion/transition/##spring
 */

export const SPRINGS = {
  /**
   * Landing animation - settling into place
   *
   * Creates a gentle settling motion perfect for elements appearing on screen.
   * The moderate stiffness and damping create a smooth, professional feel.
   *
   * @example
   * ```tsx
   * <motion.div
   *   initial={{ opacity: 0, y: 20 }}
   *   animate={{ opacity: 1, y: 0 }}
   *   transition={{ ...SPRINGS.land }}
   * >
   *   Content
   * </motion.div>
   * ```
   *
   * **Use for:**
   * - Page transitions
   * - Modal appearances
   * - Card mounting
   * - Section reveals
   */
  land: { stiffness: 400, damping: 28, mass: 0.8 },

  /**
   * Drag interaction - responsive to user input
   *
   * Slightly softer spring that feels responsive during direct manipulation.
   * The lower stiffness makes dragging feel natural and controlled.
   *
   * @example
   * ```tsx
   * <motion.div
   *   drag
   *   dragConstraints={{ left: 0, right: 300 }}
   *   transition={{ ...SPRINGS.drag }}
   * >
   *   Drag me
   * </motion.div>
   * ```
   *
   * **Use for:**
   * - Draggable elements
   * - Sliders
   * - Resizable panels
   * - Sortable lists
   */
  drag: { stiffness: 340, damping: 26, mass: 0.9 },

  /**
   * Ripple effect - quick and bouncy
   *
   * A snappy spring with higher stiffness and damping for immediate feedback.
   * Creates a satisfying bounce that confirms user actions.
   *
   * @example
   * ```tsx
   * <motion.button
   *   whileTap={{ scale: 0.95 }}
   *   transition={{ ...SPRINGS.ripple }}
   * >
   *   Click me
   * </motion.button>
   * ```
   *
   * **Use for:**
   * - Click feedback
   * - Button presses
   * - Expanding elements
   * - Micro-interactions
   */
  ripple: { stiffness: 450, damping: 45, mass: 0.7 },

  /**
   * Magnetism - snapping to targets
   *
   * High stiffness with controlled damping for precise snapping behavior.
   * Creates a magnetic feel when elements lock into position.
   *
   * @example
   * ```tsx
   * <motion.div
   *   animate={{ x: snapPosition }}
   *   transition={{ ...SPRINGS.magnetism }}
   * >
   *   Snapping element
   * </motion.div>
   * ```
   *
   * **Use for:**
   * - Snap-to-grid
   * - Magnetic docking
   * - Auto-alignment
   * - Step indicators
   */
  magnetism: { stiffness: 450, damping: 50, mass: 0.8 },

  /**
   * Cluster animation - grouping elements
   *
   * Heavier spring with moderate stiffness for weighty, grouped motion.
   * The higher mass creates a sense of momentum and cohesion.
   *
   * @example
   * ```tsx
   * <motion.div
   *   layout
   *   transition={{ ...SPRINGS.cluster }}
   * >
   *   {items.map(item => <Card key={item.id} {...item} />)}
   * </motion.div>
   * ```
   *
   * **Use for:**
   * - Card grouping
   * - Gallery layouts
   * - List reordering
   * - Masonry grids
   */
  cluster: { stiffness: 340, damping: 38, mass: 1.4 },

  /**
   * Growth animation - expanding elements
   *
   * Balanced spring for smooth scaling and growth animations.
   * Creates organic expansion that feels natural and progressive.
   *
   * @example
   * ```tsx
   * <motion.div
   *   initial={{ scaleX: 0 }}
   *   animate={{ scaleX: progress }}
   *   transition={{ ...SPRINGS.growth }}
   * >
   *   <ProgressBar />
   * </motion.div>
   * ```
   *
   * **Use for:**
   * - Progress indicators
   * - Expanding panels
   * - Accordion animations
   * - Loading states
   */
  growth: { stiffness: 360, damping: 42, mass: 1.1 },
} as const

/**
 * Type-safe spring name for use in components
 *
 * @example
 * ```tsx
 * function AnimatedCard({ springType = 'land' }: { springType?: SpringName }) {
 *   return (
 *     <motion.div transition={{ ...SPRINGS[springType] }}>
 *       Content
 *     </motion.div>
 *   )
 * }
 * ```
 */
export type SpringName = keyof typeof SPRINGS

/**
 * Get a spring configuration by name
 *
 * @param name - The name of the spring configuration
 * @returns The spring configuration object
 *
 * @example
 * ```tsx
 * const spring = getSpring('land')
 * <motion.div transition={spring}>Content</motion.div>
 * ```
 */
export function getSpring(name: SpringName) {
  return SPRINGS[name]
}

/**
 * Create a custom spring with overrides
 *
 * Allows you to use a base spring configuration and override specific properties
 * for fine-tuned control.
 *
 * @param base - The base spring to start from
 * @param overrides - Properties to override
 * @returns A new spring configuration
 *
 * @example
 * ```tsx
 * const customSpring = createCustomSpring('land', { damping: 35 })
 * <motion.div transition={customSpring}>Content</motion.div>
 * ```
 */
export function createCustomSpring(
  base: SpringName,
  overrides: Partial<{ stiffness: number; damping: number; mass: number }>
) {
  return { ...SPRINGS[base], ...overrides }
}

/**
 * Spring presets for common animation patterns
 *
 * These combine spring configurations with common animation properties
 * for even easier usage.
 */
export const SPRING_PRESETS = {
  /**
   * Fade in with landing animation
   */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: SPRINGS.land,
  },

  /**
   * Slide up with landing animation
   */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: SPRINGS.land,
  },

  /**
   * Slide down with landing animation
   */
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: SPRINGS.land,
  },

  /**
   * Scale in with ripple animation
   */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: SPRINGS.ripple,
  },

  /**
   * Pop in with bounce
   */
  popIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: SPRINGS.ripple,
  },
} as const

export type SpringPresetName = keyof typeof SPRING_PRESETS
