# shadcn/ui to Mino Experiments Migration Guide

**Version:** 1.0
**Date:** October 15, 2025
**Author:** AI-Generated Migration Documentation

---

## Executive Summary

This guide provides comprehensive instructions for migrating shadcn/ui components to adopt the design patterns, styling system, and architectural decisions implemented in the mino-experiments-1 repository.

**Migration Scope:**
- Color system upgrade (HSL → OKLCH)
- Component architecture enhancement (base → compound patterns)
- Animation system integration (tailwindcss-animate → Framer Motion + springs)
- File organization transformation (flat → feature-based)
- Styling pattern evolution (CVA → CVA + data-slot attributes)

**Expected Benefits:**
- ✅ Better color perception with OKLCH color space
- ✅ More flexible component composition with compound patterns
- ✅ Rich animations with Framer Motion spring physics
- ✅ Improved maintainability with feature-based organization
- ✅ Enhanced dark mode with opacity-aware CSS variables

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Color System Migration](#color-system-migration)
3. [Component Architecture Migration](#component-architecture-migration)
4. [Styling Patterns Migration](#styling-patterns-migration)
5. [Animation System Migration](#animation-system-migration)
6. [File Organization Migration](#file-organization-migration)
7. [TypeScript Patterns](#typescript-patterns)
8. [Accessibility Enhancements](#accessibility-enhancements)
9. [Testing Strategy](#testing-strategy)
10. [Migration Checklist](#migration-checklist)

---

## Prerequisites

### Required Dependencies

```bash
# Install mino-specific dependencies
pnpm add framer-motion@^12.23.24
pnpm add geist@^1.5.1
pnpm add @tailwindcss/postcss@^4.1.14
pnpm add tailwindcss@^4.1.14
pnpm add class-variance-authority@^0.7.1
pnpm add tailwind-merge@^3.3.1
pnpm add @radix-ui/react-slot@^1.2.3

# Remove old animation dependencies (optional)
pnpm remove tailwindcss-animate
```

### Environment Setup

```bash
# Backup your current shadcn/ui setup
git checkout -b backup/shadcn-ui-original

# Create migration branch
git checkout -b feat/migrate-to-mino-patterns
```

---

## Color System Migration

### Step 1: Update CSS Variables to OKLCH

**File:** `globals.css` or equivalent

**Before (shadcn/ui - HSL):**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --ring: 0 0% 63.9%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --border: 0 0% 14.9%;
}
```

**After (mino - OKLCH):**
```css
:root {
  --radius: 0.625rem;  /* 10px base radius */

  /* Core colors in OKLCH color space */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  /* Card system */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);

  /* Semantic colors */
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);

  /* Input system */
  --input: oklch(0.922 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.205 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.205 0 0);
  --muted-foreground: oklch(0.6 0 0);
  --accent: oklch(0.205 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);  /* Opacity support */
  --input: oklch(1 0 0 / 15%);   /* Opacity support */
  --ring: oklch(0.708 0 0);
}
```

### Step 2: Add Tailwind v4 Theme Inline

Add these to your `globals.css`:

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);  /* 6.25px */
  --radius-md: calc(var(--radius) - 2px);  /* 8.25px */
  --radius-lg: var(--radius);              /* 10px */
  --radius-xl: calc(var(--radius) + 4px);  /* 14.25px */
}
```

### Step 3: Update Tailwind Config

**File:** `tailwind.config.ts`

**Before:**
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        // ...
      },
    },
  },
};
```

**After:**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
```

### OKLCH Color Conversion Tool

Use this helper to convert HSL to OKLCH:

```typescript
// lib/utils/color-converter.ts
export function hslToOklch(h: number, s: number, l: number): string {
  // Simplified conversion (use proper color library in production)
  const lightness = l / 100;
  const chroma = s / 100;
  const hue = h;

  return `oklch(${lightness} ${chroma} ${hue})`;
}

// Example usage:
// hslToOklch(0, 0, 100) → oklch(1 0 0) (white)
// hslToOklch(0, 0, 3.9) → oklch(0.145 0 0) (dark gray)
```

---

## Component Architecture Migration

### Pattern 1: Simple Component → Compound Component

**Example: Input → InputGroup**

**Before (shadcn/ui):**
```tsx
// components/ui/input.tsx
function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border",
        className
      )}
      {...props}
    />
  );
}

// Usage
<Input placeholder="Enter text" />
```

**After (mino - Compound Pattern):**
```tsx
// components/ui/input-group.tsx
const InputGroup = ({ children, align, className, ...props }: InputGroupProps) => {
  return (
    <div
      data-slot="input-group"
      data-align={align}
      role="group"
      className={cn(inputGroupVariants({ align, className }))}
      {...props}
    >
      {children}
    </div>
  );
};

const InputGroupControl = ({ className, ...props }: ControlProps) => {
  return (
    <div
      data-slot="input-group-control"
      className={cn(inputGroupControlVariants({ className }))}
      {...props}
    />
  );
};

const InputGroupAddon = ({ className, size, ...props }: AddonProps) => {
  return (
    <div
      data-slot="input-group-addon"
      data-size={size}
      className={cn(inputGroupAddonVariants({ size, className }))}
      {...props}
    />
  );
};

const InputGroupTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(textareaVariants({ className }))}
        {...props}
      />
    );
  }
);

// Export compound component
InputGroup.Control = InputGroupControl;
InputGroup.Addon = InputGroupAddon;
InputGroup.Textarea = InputGroupTextarea;

export { InputGroup };

// Usage (flexible composition)
<InputGroup align="inline-end">
  <InputGroup.Control>
    <Input placeholder="Amount" />
  </InputGroup.Control>
  <InputGroup.Addon>USD</InputGroup.Addon>
</InputGroup>

<InputGroup align="block-end">
  <InputGroup.Control>
    <InputGroup.Textarea placeholder="Description" />
  </InputGroup.Control>
  <InputGroup.Addon size="sm">
    <Button variant="ghost">Submit</Button>
  </InputGroup.Addon>
</InputGroup>
```

### Pattern 2: Add Data-Slot Attributes

**Key Principle:** Use `data-slot` for component identification and parent styling

```tsx
// components/ui/button.tsx
function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Parent Component Styling with `has-[]`:**

```css
/* In InputGroup styles */
.input-group {
  /* Style child buttons within the group */
  &:has([data-slot="button"][data-size="default"]) {
    [data-slot="button"] {
      @apply h-8 px-3;
    }
  }

  /* Style based on button presence */
  &:has([data-slot="button"]) [data-slot="input"] {
    @apply rounded-r-none;
  }
}
```

### Pattern 3: CVA Variants Enhancement

**Before (shadcn/ui):**
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**After (mino - Enhanced CVA):**
```tsx
const buttonVariants = cva(
  // Base classes with enhanced focus/accessibility
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Key Enhancements:**
- ✅ SVG icon handling with `[&_svg]` selector
- ✅ Focus-visible ring (3px) for keyboard navigation
- ✅ ARIA invalid state styling
- ✅ Dark mode variants
- ✅ `has-[>svg]` for automatic padding adjustment
- ✅ `shadow-xs` for subtle depth
- ✅ Transition-all for smooth state changes

---

## Styling Patterns Migration

### Pattern 1: Focus Ring System

**Add to all interactive elements:**

```tsx
// Base focus ring pattern
"outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// With dark mode
"outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:focus-visible:ring-ring/40"
```

### Pattern 2: Error State Styling

```tsx
// Add ARIA invalid state styling
"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
```

### Pattern 3: Shadow System

**Add to globals.css:**

```css
/* Shadow utilities */
.shadow-xs {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.shadow-sm {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

### Pattern 4: Animation State Styling

```tsx
// Dropdown/Select content animation
"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
```

---

## Animation System Migration

### Step 1: Install Framer Motion

```bash
pnpm add framer-motion@^12.23.24
```

### Step 2: Create Springs Configuration

**File:** `lib/springs.ts`

```typescript
/**
 * Framer Motion spring configurations for consistent animation feel
 * across the application.
 */

export const SPRINGS = {
  /**
   * Landing animation - settling into place
   * Use for: Page transitions, modal appearances
   */
  land: { stiffness: 400, damping: 28, mass: 0.8 },

  /**
   * Drag interaction - responsive to user input
   * Use for: Draggable elements, sliders
   */
  drag: { stiffness: 340, damping: 26, mass: 0.9 },

  /**
   * Ripple effect - quick and bouncy
   * Use for: Click feedback, expanding elements
   */
  ripple: { stiffness: 450, damping: 45, mass: 0.7 },

  /**
   * Magnetism - snapping to targets
   * Use for: Snap-to-grid, magnetic docking
   */
  magnetism: { stiffness: 450, damping: 50, mass: 0.8 },

  /**
   * Cluster animation - grouping elements
   * Use for: Card grouping, gallery layouts
   */
  cluster: { stiffness: 340, damping: 38, mass: 1.4 },

  /**
   * Growth animation - expanding elements
   * Use for: Progress indicators, expanding panels
   */
  growth: { stiffness: 360, damping: 42, mass: 1.1 },
} as const;

export type SpringName = keyof typeof SPRINGS;
```

### Step 3: Convert Tailwind Animations to Framer Motion

**Before (tailwindcss-animate):**
```tsx
<div className="animate-in fade-in-0 zoom-in-95">
  Content
</div>
```

**After (Framer Motion):**
```tsx
import { motion } from 'framer-motion';
import { SPRINGS } from '@/lib/springs';

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ ...SPRINGS.land }}
>
  Content
</motion.div>
```

### Step 4: Advanced Animation Patterns

**Layout Animations:**
```tsx
<motion.div layout transition={{ ...SPRINGS.land }}>
  {items.map(item => (
    <motion.div key={item.id} layout>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Gesture Animations:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ ...SPRINGS.ripple }}
>
  Click Me
</motion.button>
```

**Stagger Animations:**
```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ ...SPRINGS.land }}
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

## File Organization Migration

### Current Structure (shadcn/ui)

```
components/
└── ui/
    ├── button.tsx
    ├── input.tsx
    ├── select.tsx
    ├── dropdown-menu.tsx
    └── ...
```

### Target Structure (mino)

```
components/
├── ui/                      # Base UI components (keep these)
│   ├── button.tsx
│   ├── input.tsx
│   ├── input-group.tsx      # New compound component
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── tooltip.tsx
│   └── dropdown-menu.tsx
├── ai-elements/             # AI-specific components
│   ├── prompt-input.tsx     # Complex compound component
│   └── ...
├── execution/               # Execution feature
│   ├── ExecutionViewer.tsx
│   ├── ProgressTracker.tsx
│   ├── ExecutionStats.tsx
│   └── ...
├── learning/                # Learning/feedback feature
│   └── ...
├── monitoring/              # Monitoring feature
│   └── ...
├── eval/                    # Evaluation feature
│   └── ...
├── gallery/                 # Gallery/preview feature
│   └── ...
└── backgrounds/             # Background effects
    ├── FogSunriseBackground.tsx
    └── ...
```

### Migration Steps

1. **Keep base UI components** in `components/ui/`
2. **Create feature folders** for domain-specific components
3. **Move complex components** to appropriate feature folders
4. **Update imports** across the codebase

**Import Update Script:**

```bash
# Find and replace imports
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@\/components\/ui\/execution/@\/components\/execution/g'
```

---

## TypeScript Patterns

### Pattern 1: Props Interface Extension

```typescript
// Extend native HTML props
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Extend Radix UI props
interface SelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  // Additional props
}
```

### Pattern 2: Discriminated Unions

```typescript
export type Frequency = 'one-time' | 'daily' | 'weekly' | 'monthly';
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface Warning {
  type: 'ambiguous_location' | 'vague_target' | 'missing_fields' | 'infeasible_scope' | 'low_confidence';
  severity: 'low' | 'medium' | 'high';
  message: string;
}
```

### Pattern 3: Generic Hooks

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Accessibility Enhancements

### Focus Management

```tsx
// Add focus-visible ring to all interactive elements
"outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// Keyboard navigation support
const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
  if (e.key === "Enter") {
    if (e.nativeEvent.isComposing) return; // IME support
    if (e.shiftKey) return; // Shift+Enter = newline
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
};
```

### ARIA Attributes

```tsx
// Add semantic ARIA labels
<input
  aria-label="Upload files"
  aria-invalid={!!error}
  aria-describedby={error ? "error-message" : undefined}
/>

// Live regions for dynamic content
<div aria-live="polite">
  {attachments.map(file => (
    <div key={file.id}>{file.name}</div>
  ))}
</div>

// Semantic grouping
<div role="group" aria-labelledby="group-label">
  <span id="group-label">Input Group</span>
  {/* inputs */}
</div>
```

---

## Testing Strategy

### Visual Regression Testing

```typescript
// tests/visual/button.spec.ts
import { test, expect } from '@playwright/test';

test('button variants render correctly', async ({ page }) => {
  await page.goto('/components/button');

  // Test all variants
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];

  for (const variant of variants) {
    await expect(page.locator(`[data-variant="${variant}"]`)).toHaveScreenshot(`button-${variant}.png`);
  }
});
```

### Accessibility Testing

```typescript
// tests/a11y/button.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('button is accessible', async ({ page }) => {
  await page.goto('/components/button');
  await injectAxe(page);
  await checkA11y(page);
});
```

### Animation Testing

```typescript
// tests/animation/motion.spec.ts
test('button responds to hover', async ({ page }) => {
  const button = page.locator('[data-slot="button"]');

  await button.hover();

  // Check transform applied
  const transform = await button.evaluate(el =>
    window.getComputedStyle(el).transform
  );

  expect(transform).not.toBe('none');
});
```

---

## Migration Checklist

### Phase 1: Foundation (Week 1)

- [ ] Install dependencies (Framer Motion, Tailwind v4, etc.)
- [ ] Update `globals.css` with OKLCH variables
- [ ] Update `tailwind.config.ts` with new color system
- [ ] Create `lib/springs.ts` for animation configs
- [ ] Create `lib/utils/cn.ts` if not exists
- [ ] Update PostCSS config for Tailwind v4

### Phase 2: Base Components (Week 2)

- [ ] Migrate Button component with enhanced CVA
- [ ] Migrate Input component with focus rings
- [ ] Create InputGroup compound component
- [ ] Migrate Textarea component
- [ ] Migrate Select component with animations
- [ ] Migrate Dropdown Menu component
- [ ] Add data-slot attributes to all components

### Phase 3: Styling Patterns (Week 2-3)

- [ ] Add focus-visible rings to all interactive elements
- [ ] Add aria-invalid state styling
- [ ] Implement shadow system (xs, sm, md, lg)
- [ ] Add dark mode opacity variants
- [ ] Update all CVA base classes with accessibility

### Phase 4: Animation System (Week 3)

- [ ] Convert Tailwind animations to Framer Motion
- [ ] Implement spring transitions
- [ ] Add gesture animations (whileHover, whileTap)
- [ ] Implement layout animations where needed
- [ ] Add stagger animations for lists

### Phase 5: File Organization (Week 4)

- [ ] Create feature folders (execution, learning, monitoring, etc.)
- [ ] Move domain components to feature folders
- [ ] Update all imports
- [ ] Verify no broken imports
- [ ] Update documentation

### Phase 6: Testing & Validation (Week 4-5)

- [ ] Visual regression tests for all components
- [ ] Accessibility audit with axe-core
- [ ] Keyboard navigation testing
- [ ] Animation performance testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness testing

### Phase 7: Documentation (Week 5)

- [ ] Document all new patterns
- [ ] Create component examples
- [ ] Update Storybook/documentation site
- [ ] Create migration guide for team
- [ ] Record demo videos

### Phase 8: Deployment (Week 6)

- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Common Pitfalls & Solutions

### Pitfall 1: OKLCH Browser Support

**Issue:** OKLCH not supported in older browsers

**Solution:** Add fallback HSL values

```css
:root {
  /* Fallback */
  --background: hsl(0 0% 100%);
  /* Modern browsers */
  --background: oklch(1 0 0);
}
```

### Pitfall 2: Framer Motion Bundle Size

**Issue:** Framer Motion adds ~50KB to bundle

**Solution:** Use code splitting and lazy loading

```typescript
import dynamic from 'next/dynamic';

const AnimatedComponent = dynamic(() => import('./AnimatedComponent'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

### Pitfall 3: Data-Slot Selector Specificity

**Issue:** Data-slot styles not applying

**Solution:** Increase specificity or use `!important` sparingly

```css
/* Low specificity - may not work */
[data-slot="button"] {
  @apply h-8;
}

/* Higher specificity */
.input-group [data-slot="button"] {
  @apply h-8 !important;
}
```

### Pitfall 4: Animation Performance

**Issue:** Animations causing layout thrashing

**Solution:** Only animate transform and opacity

```tsx
// Bad - animates width (causes reflow)
<motion.div animate={{ width: '100%' }} />

// Good - animates scale (GPU accelerated)
<motion.div animate={{ scaleX: 1 }} />
```

---

## Resources

### Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [OKLCH Color Picker](https://oklch.com/)

### Tools
- [Mermaid Live Editor](https://mermaid.live) - Visualize migration diagrams
- [Playwright](https://playwright.dev/) - E2E testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing

### Migration Support
- Create GitHub issues for questions
- Join discussions in repository
- Review mino-experiments-1 source code

---

## Conclusion

This migration guide provides a comprehensive path from shadcn/ui to the enhanced patterns in mino-experiments-1. Follow the phases systematically, test thoroughly, and leverage the patterns to build more flexible, accessible, and performant components.

**Key Takeaways:**
1. OKLCH provides better color perception
2. Compound components offer superior composition
3. Framer Motion enables rich interactions
4. Feature-based organization scales better
5. Enhanced CVA improves type safety

**Success Metrics:**
- ✅ All components migrated
- ✅ Accessibility score 100/100
- ✅ Animation performance 60fps
- ✅ Bundle size within budget
- ✅ Team onboarded successfully

Good luck with your migration! 🚀
