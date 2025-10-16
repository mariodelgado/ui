# Mino Design Patterns Reference

**Comprehensive Pattern Catalog from mino-experiments-1**

**Version:** 1.0
**Date:** October 15, 2025
**Codebase:** mino-experiments-1 (10,787 lines)

---

## Table of Contents

1. [Component Architecture Patterns](#component-architecture-patterns)
2. [Styling Patterns](#styling-patterns)
3. [State Management Patterns](#state-management-patterns)
4. [Data Flow Patterns](#data-flow-patterns)
5. [TypeScript Patterns](#typescript-patterns)
6. [Accessibility Patterns](#accessibility-patterns)
7. [Animation Patterns](#animation-patterns)
8. [Naming Conventions](#naming-conventions)
9. [File Organization](#file-organization)
10. [Performance Patterns](#performance-patterns)

---

## Component Architecture Patterns

### 1.1 Compound Component Pattern

**Location:** `src/components/ai-elements/prompt-input.tsx` (1,182 lines)

**Description:** Components that work together to form a complete UI, sharing state via React Context.

**Implementation:**

```typescript
// 1. Create context for shared state
const PromptInputContext = createContext<PromptInputController | null>(null);

// 2. Provider component
export function PromptInputProvider({ children, initialInput }: ProviderProps) {
  const controller = usePromptInputController({ initialInput });

  return (
    <PromptInputContext.Provider value={controller}>
      {children}
    </PromptInputContext.Provider>
  );
}

// 3. Parent component
export const PromptInput = ({ onSubmit, children, ...props }: PromptInputProps) => {
  const controller = useOptionalPromptInputController();

  return (
    <form
      data-slot="prompt-input"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(/* ... */);
      }}
    >
      {children}
    </form>
  );
};

// 4. Child components that access context
export function PromptInputTextarea({ ...props }: TextareaProps) {
  const controller = useOptionalPromptInputController();

  return (
    <InputGroupTextarea
      value={controller?.textInput.value}
      onChange={(e) => controller?.textInput.setInput(e.currentTarget.value)}
      {...props}
    />
  );
}

export function PromptInputAttachments({ children }: AttachmentsProps) {
  const attachments = usePromptInputAttachments();

  return (
    <div>
      {attachments.files.map((file) => (
        <Fragment key={file.id}>{children(file)}</Fragment>
      ))}
    </div>
  );
}

// 5. Usage - Flexible composition
<PromptInputProvider initialInput="">
  <PromptInput onSubmit={handleSubmit}>
    <PromptInputBody>
      <PromptInputAttachments>
        {(attachment) => <PromptInputAttachment data={attachment} />}
      </PromptInputAttachments>
      <PromptInputTextarea placeholder="Type your prompt..." />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton />
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInputBody>
  </PromptInput>
</PromptInputProvider>
```

**Benefits:**
- ✅ Highly flexible composition API
- ✅ Shared state without prop drilling
- ✅ Parts can be rearranged or omitted
- ✅ Type-safe with TypeScript
- ✅ Encapsulated state management

**When to Use:**
- Complex UI with multiple interacting parts
- Need flexible composition
- Shared state between components
- Want to avoid prop drilling

---

### 1.2 Dual-Mode Component Pattern

**Location:** `src/components/ai-elements/prompt-input.tsx` (Lines 453-832)

**Description:** Components that work both as controlled (with provider) and uncontrolled (standalone).

**Implementation:**

```typescript
// 1. Optional context hook
function useOptionalPromptInputController() {
  return useContext(PromptInputContext); // Returns null if no provider
}

// 2. Component with dual-mode support
export const PromptInput = ({ children, ...props }: PromptInputProps) => {
  const controller = useOptionalPromptInputController();
  const usingProvider = !!controller;

  // Local state (used only when no provider)
  const [localItems, setLocalItems] = useState<FileUIPart[]>([]);

  // Conditional state source
  const files = usingProvider ? controller.attachments.files : localItems;

  // Conditional actions
  const addFile = usingProvider
    ? (file) => controller.attachments.add(file)
    : (file) => setLocalItems((prev) => [...prev, file]);

  return <form>{/* render */}</form>;
};

// 3. Usage - Works both ways
// Uncontrolled (standalone)
<PromptInput onSubmit={handleSubmit}>
  <PromptInputTextarea />
</PromptInput>

// Controlled (with provider)
<PromptInputProvider>
  <PromptInput onSubmit={handleSubmit}>
    <PromptInputTextarea />
  </PromptInput>
</PromptInputProvider>
```

**Benefits:**
- ✅ Flexible - works with or without provider
- ✅ No API duplication
- ✅ Progressive enhancement
- ✅ Backward compatible

**When to Use:**
- Want maximum flexibility
- Component might be used in different contexts
- Need both controlled and uncontrolled modes

---

### 1.3 Slot Component Pattern

**Location:** `src/components/ui/button.tsx` (Lines 39-58)

**Description:** Components that can render as child elements using Radix UI Slot.

**Implementation:**

```typescript
import { Slot } from '@radix-ui/react-slot';

function Button({
  asChild = false,
  variant,
  size,
  className,
  ...props
}: ButtonProps & { asChild?: boolean }) {
  // Use Slot if asChild=true, otherwise use button
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// Usage 1: Normal button
<Button variant="default">Click me</Button>
// Renders: <button class="...">Click me</button>

// Usage 2: Button styles on Link
<Button asChild>
  <Link href="/home">Go Home</Link>
</Button>
// Renders: <a href="/home" class="...">Go Home</a>
```

**Benefits:**
- ✅ Maintains semantic HTML
- ✅ Applies styles to any element
- ✅ No wrapper divs
- ✅ Preserves accessibility

**When to Use:**
- Need button styling on links
- Want semantic HTML
- Avoid wrapper elements

---

### 1.4 Data-Slot Identification Pattern

**Location:** Used throughout (60+ components)

**Description:** Use `data-slot` attributes for component identification and parent-aware styling.

**Implementation:**

```typescript
// 1. Add data-slot to component
function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    />
  );
}

function Input({ ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(inputVariants())}
      {...props}
    />
  );
}

// 2. Parent component uses has-[] to style children
const inputGroupVariants = cva(
  "flex gap-2",
  {
    variants: {
      align: {
        // When InputGroup has a button, adjust input styling
        "inline-end": "has-[>[data-slot='button']]:children:[data-slot='input']:rounded-r-none",
      },
    },
  }
);

// 3. CSS-based cross-component styling
.input-group {
  /* Style buttons within input groups */
  &:has([data-slot="input"][data-size="sm"]) [data-slot="button"] {
    @apply h-8 px-2;
  }

  /* Style inputs when group has button */
  &:has([data-slot="button"]) [data-slot="input"] {
    @apply rounded-r-none border-r-0;
  }
}
```

**Benefits:**
- ✅ Parent-aware child styling without JavaScript
- ✅ Semantic component identification
- ✅ CSS-only cross-component state
- ✅ No prop drilling needed

**When to Use:**
- Complex parent-child relationships
- Need cross-component styling
- Want CSS-only solutions

---

## Styling Patterns

### 2.1 OKLCH Color System

**Location:** `src/app/globals.css` (Lines 14-43)

**Description:** Use OKLCH color space for perceptually uniform colors.

**Implementation:**

```css
:root {
  /* OKLCH: oklch(lightness chroma hue) */
  --background: oklch(1 0 0);        /* White */
  --foreground: oklch(0.145 0 0);    /* Dark gray */
  --primary: oklch(0.205 0 0);       /* Darker gray */
  --border: oklch(0.922 0 0);        /* Light gray */

  /* Colored values */
  --destructive: oklch(0.577 0.245 27.325);  /* Red/orange */

  /* Radius tokens */
  --radius: 0.625rem;  /* 10px */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);

  /* Opacity support in dark mode */
  --border: oklch(1 0 0 / 10%);   /* 10% white */
  --input: oklch(1 0 0 / 15%);    /* 15% white */
}

/* Tailwind v4 inline theme */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);  /* 6.25px */
  --radius-md: calc(var(--radius) - 2px);  /* 8.25px */
  --radius-lg: var(--radius);              /* 10px */
  --radius-xl: calc(var(--radius) + 4px);  /* 14.25px */
}
```

**Tailwind Config:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

**Benefits:**
- ✅ Perceptually uniform colors
- ✅ Better interpolation
- ✅ Opacity support in OKLCH
- ✅ Future-proof (CSS Color Level 4)

**When to Use:**
- All color definitions
- Dark mode with opacity
- Gradient interpolations

---

### 2.2 CVA (Class Variance Authority) Pattern

**Location:** `src/components/ui/button.tsx` (Lines 7-37)

**Description:** Type-safe component variants with Tailwind classes.

**Implementation:**

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

// 1. Define variants with CVA
const buttonVariants = cva(
  // Base classes (always applied)
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:opacity-50",

  // Variants configuration
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Extract TypeScript types from CVA
type ButtonVariants = VariantProps<typeof buttonVariants>;

// 3. Component props interface
interface ButtonProps
  extends React.ComponentProps<"button">,
    ButtonVariants {
  asChild?: boolean;
}

// 4. Component implementation
function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// 5. Usage - Fully type-safe
<Button variant="destructive" size="lg">
  Delete
</Button>
// TypeScript ensures only valid variants
```

**Advanced CVA with Compound Variants:**

```typescript
const inputGroupVariants = cva(
  "flex",
  {
    variants: {
      align: {
        "inline-start": "flex-row",
        "inline-end": "flex-row-reverse",
      },
      size: {
        sm: "gap-1",
        default: "gap-2",
      },
    },
    compoundVariants: [
      {
        align: "inline-end",
        size: "sm",
        class: "gap-1.5",  // Override when both conditions match
      },
    ],
    defaultVariants: {
      align: "inline-start",
      size: "default",
    },
  }
);
```

**Benefits:**
- ✅ Type-safe variants
- ✅ Composable variant combinations
- ✅ Default variants
- ✅ Compound variants for complex conditions
- ✅ IntelliSense support

**When to Use:**
- Components with multiple visual variants
- Need type safety
- Want composable variants

---

### 2.3 Focus Ring System

**Location:** All interactive components

**Description:** Consistent 3px focus ring for keyboard navigation.

**Implementation:**

```typescript
// Base focus ring classes
const focusRingClasses = "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

// In CVA base classes
const buttonVariants = cva(
  "inline-flex items-center justify-center ... " +
  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: { /* ... */ }
  }
);

// Input with focus ring
<input
  className={cn(
    "h-9 w-full rounded-md border",
    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  )}
/>
```

**CSS Variables:**

```css
:root {
  --ring: oklch(0.708 0 0);  /* Medium gray for light mode */
}

.dark {
  --ring: oklch(0.708 0 0);  /* Same for dark mode */
}
```

**Benefits:**
- ✅ Consistent focus indication
- ✅ Only visible for keyboard users (focus-visible)
- ✅ Accessible (WCAG compliant)
- ✅ Subtle but noticeable

**When to Use:**
- All interactive elements
- Buttons, inputs, links
- Custom interactive components

---

### 2.4 Error State Styling

**Location:** All form components

**Description:** Visual feedback for invalid form fields.

**Implementation:**

```typescript
// Add to CVA base classes
const inputVariants = cva(
  "h-9 w-full rounded-md border ... " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
);

// Usage with React Hook Form
<input
  {...register('email', { required: true })}
  aria-invalid={!!errors.email}
/>

// Or manual state
<input
  aria-invalid={hasError}
  className={cn(
    "h-9 w-full rounded-md border",
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
  )}
/>
```

**Benefits:**
- ✅ Automatic styling based on ARIA state
- ✅ No JavaScript needed for styling
- ✅ Accessible to screen readers
- ✅ Consistent error indication

**When to Use:**
- Form inputs
- Validation feedback
- Error states

---

### 2.5 Animation State Styling

**Location:** Dropdown menus, selects, popovers

**Description:** Animate component state changes using data attributes.

**Implementation:**

```typescript
// Radix UI provides data-state attribute
<DropdownMenuContent
  className={cn(
    "min-w-32 rounded-md border bg-popover shadow-md",
    // Animate based on state
    "data-[state=open]:animate-in",
    "data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0",
    "data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95",
    "data-[state=open]:zoom-in-95",
    // Direction-based slide
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2"
  )}
>
  {children}
</DropdownMenuContent>
```

**Benefits:**
- ✅ CSS-only animations
- ✅ State-driven (declarative)
- ✅ Tailwind animation utilities
- ✅ GPU-accelerated

**When to Use:**
- Dropdown menus
- Popovers
- Tooltips
- Modal dialogs

---

## State Management Patterns

### 3.1 Zustand Global State

**Location:** `src/lib/store/intent-store.ts` (Lines 1-109)

**Description:** Lightweight global state with Zustand, including time-travel debugging.

**Implementation:**

```typescript
import { create } from 'zustand';

// 1. Define state interface
interface IntentState {
  // State
  intent: ParsedIntent | null;
  refinements: Refinements;
  history: ParsedIntent[];
  historyIndex: number;

  // Actions
  setIntent: (intent: ParsedIntent) => void;
  updateFields: (fields: Field[]) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

// 2. Create store with actions
export const useIntentStore = create<IntentState>((set, get) => ({
  // Initial state
  intent: null,
  refinements: { fields: [], frequency: 'one-time', scope: 1 },
  history: [],
  historyIndex: -1,

  // Actions with immutable updates
  setIntent: (intent) => {
    set((state) => ({
      intent,
      history: [...state.history.slice(0, state.historyIndex + 1), intent],
      historyIndex: state.historyIndex + 1,
    }));
  },

  updateFields: (fields) => {
    set((state) => ({
      refinements: { ...state.refinements, fields },
    }));
  },

  // Time-travel debugging
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        intent: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        intent: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
      });
    }
  },

  reset: () => {
    set({
      intent: null,
      refinements: { fields: [], frequency: 'one-time', scope: 1 },
      history: [],
      historyIndex: -1,
    });
  },
}));

// 3. Usage in components
function AgentCreator() {
  // Select specific slices
  const intent = useIntentStore((state) => state.intent);
  const setIntent = useIntentStore((state) => state.setIntent);
  const undo = useIntentStore((state) => state.undo);
  const redo = useIntentStore((state) => state.redo);

  return (
    <div>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
}
```

**Benefits:**
- ✅ Simple API (no boilerplate)
- ✅ Time-travel debugging
- ✅ Selector pattern prevents re-renders
- ✅ TypeScript support
- ✅ No context providers needed

**When to Use:**
- Global application state
- Shared state across routes
- Need undo/redo functionality
- Complex state logic

---

### 3.2 Local State Co-location

**Location:** `src/components/Navigation.tsx` (Lines 27-60)

**Description:** Keep UI state local to components when it doesn't need to be shared.

**Implementation:**

```typescript
export function Navigation({ currentStep, onNavigate }: NavigationProps) {
  // Local UI state - not shared globally
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes
  useEffect(() => {
    if (currentStep !== undefined) {
      const index = NAV_LINKS.findIndex((l) => l.step === currentStep);
      if (index !== -1) setActiveIndex(index);
    }
  }, [currentStep]);

  // UI calculations
  useEffect(() => {
    const linkElement = navRef.current?.children[activeIndex] as HTMLElement;

    if (linkElement) {
      setIndicatorStyle({
        left: linkElement.offsetLeft,
        width: linkElement.offsetWidth,
      });
    }
  }, [activeIndex]);

  return (
    <nav ref={navRef}>
      {/* ... */}
      <motion.div
        className="absolute bottom-0 h-0.5 bg-primary"
        style={indicatorStyle}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </nav>
  );
}
```

**Benefits:**
- ✅ No unnecessary global state
- ✅ Encapsulated logic
- ✅ Better performance (isolated re-renders)
- ✅ Easier to test

**When to Use:**
- UI-only state (hover, focus, animation)
- Component-specific logic
- Temporary state
- Form state (unless shared)

---

## Data Flow Patterns

### 4.1 Server Component Pattern

**Location:** `src/app/page.tsx`, `src/app/layout.tsx`

**Description:** Use Next.js server components for static content and data fetching.

**Implementation:**

```typescript
// app/page.tsx - Server Component (default)
import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side redirect (no client JavaScript)
  redirect('/create');
}

// app/layout.tsx - Server Component with metadata
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Mino - AI Agent Platform',
  description: 'Create and manage AI agents',
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Benefits:**
- ✅ Better performance (less client JS)
- ✅ SEO friendly
- ✅ Reduced hydration cost
- ✅ Server-side data fetching

**When to Use:**
- Static content
- Layouts
- Metadata
- Server-side redirects

---

### 4.2 Client Component Boundary

**Location:** All interactive components

**Description:** Mark interactive components with 'use client' directive.

**Implementation:**

```typescript
// components/ProjectCreator.tsx
'use client';  // ← Marks client component boundary

import { useState } from 'react';
import { motion } from 'framer-motion';

export function ProjectCreator({ onProjectCreated }: Props) {
  const [title, setTitle] = useState('');  // Client-side state
  const [isGenerating, setIsGenerating] = useState(false);

  // Client-side event handler
  const handleCreate = async () => {
    setIsGenerating(true);
    // ...
  };

  // Framer Motion requires client-side
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
    </motion.div>
  );
}
```

**Rules:**
- ✅ Use 'use client' for interactive components
- ✅ Use hooks (useState, useEffect) only in client components
- ✅ Use third-party libraries (Framer Motion) in client components
- ✅ Keep server components as default when possible

**When to Use:**
- Need React hooks
- Event handlers
- Browser APIs
- Third-party client libraries

---

## TypeScript Patterns

### 5.1 Discriminated Union Pattern

**Location:** `src/lib/types/intent.ts` (Lines 5-20)

**Description:** Use type unions with discriminator property for exhaustive checking.

**Implementation:**

```typescript
// 1. Simple discriminated union
export type Frequency = 'one-time' | 'daily' | 'weekly' | 'monthly';
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

// 2. Object discriminated union
export interface Warning {
  type: 'ambiguous_location' | 'vague_target' | 'missing_fields' | 'infeasible_scope' | 'low_confidence';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

// 3. Complex discriminated union
export type AttachmentType =
  | { type: 'file'; url: string; name: string; size: number }
  | { type: 'image'; url: string; width: number; height: number }
  | { type: 'text'; content: string };

// 4. Usage with exhaustive checking
function handleAttachment(attachment: AttachmentType) {
  switch (attachment.type) {
    case 'file':
      // TypeScript knows: attachment.url, attachment.name, attachment.size
      return `File: ${attachment.name} (${attachment.size} bytes)`;

    case 'image':
      // TypeScript knows: attachment.url, attachment.width, attachment.height
      return `Image: ${attachment.width}x${attachment.height}`;

    case 'text':
      // TypeScript knows: attachment.content
      return `Text: ${attachment.content}`;

    default:
      // Exhaustive check - TypeScript error if case missing
      const exhaustiveCheck: never = attachment;
      return exhaustiveCheck;
  }
}
```

**Benefits:**
- ✅ Exhaustive type checking
- ✅ IntelliSense support
- ✅ Runtime safety
- ✅ Self-documenting

**When to Use:**
- Multiple states with different properties
- Need exhaustive checks
- Complex conditional logic

---

### 5.2 Generic Hook Pattern

**Location:** `src/hooks/useDebounce.ts` (Lines 3-17)

**Description:** Create reusable hooks with TypeScript generics.

**Implementation:**

```typescript
// 1. Generic hook definition
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

// 2. Usage - Type inferred automatically
const debouncedInput = useDebounce<string>(input, 2000);
// or with inference:
const debouncedInput = useDebounce(input, 2000);  // T = string inferred

const debouncedNumber = useDebounce(count, 500);  // T = number inferred

const debouncedObject = useDebounce({ name: 'John' }, 1000);  // T = { name: string }
```

**Benefits:**
- ✅ Reusable across types
- ✅ Type inference
- ✅ Type safety
- ✅ IntelliSense support

**When to Use:**
- Reusable logic
- Works with multiple types
- Utility hooks

---

### 5.3 Props Interface Extension

**Location:** All components

**Description:** Extend native HTML/Radix props with custom properties.

**Implementation:**

```typescript
// 1. Extend native HTML element
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Usage includes all button props + variants + asChild
<Button onClick={handleClick} disabled={isDisabled} variant="destructive">
  Delete
</Button>

// 2. Extend Radix UI component
interface SelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  placeholder?: string;
  error?: string;
}

// 3. Extend and override
interface InputProps extends Omit<React.ComponentProps<"input">, 'size'> {
  size?: 'sm' | 'default' | 'lg';  // Override native size attribute
}
```

**Benefits:**
- ✅ Inherit all native props
- ✅ Type-safe extensions
- ✅ IntelliSense for all props
- ✅ Can override when needed

**When to Use:**
- Wrapping native elements
- Extending component libraries
- Adding custom props

---

## Animation Patterns

### 6.1 Spring Configuration Pattern

**Location:** `src/lib/springs.ts` (Lines 6-13)

**Description:** Centralized spring physics configurations for consistent animations.

**Implementation:**

```typescript
// 1. Define spring configurations
export const SPRINGS = {
  land: { stiffness: 400, damping: 28, mass: 0.8 },
  drag: { stiffness: 340, damping: 26, mass: 0.9 },
  ripple: { stiffness: 450, damping: 45, mass: 0.7 },
  magnetism: { stiffness: 450, damping: 50, mass: 0.8 },
  cluster: { stiffness: 340, damping: 38, mass: 1.4 },
  growth: { stiffness: 360, damping: 42, mass: 1.1 },
} as const;

export type SpringName = keyof typeof SPRINGS;

// 2. Usage in components
import { motion } from 'framer-motion';
import { SPRINGS } from '@/lib/springs';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ ...SPRINGS.land }}
>
  Content
</motion.div>

// 3. Dynamic spring selection
function AnimatedCard({ springType = 'land' }: { springType?: SpringName }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...SPRINGS[springType] }}
    >
      Card
    </motion.div>
  );
}
```

**Spring Characteristics:**
- **land**: Settling motion (page transitions, modals)
- **drag**: Responsive to input (draggable elements)
- **ripple**: Quick and bouncy (click feedback)
- **magnetism**: Snapping effect (snap-to-grid)
- **cluster**: Grouping motion (card layouts)
- **growth**: Expanding elements (progress bars)

**Benefits:**
- ✅ Consistent feel across UI
- ✅ Named semantic configs
- ✅ Easy to adjust globally
- ✅ Type-safe

**When to Use:**
- All Framer Motion animations
- Need consistent animation feel
- Want centralized control

---

### 6.2 Gesture Animation Pattern

**Location:** Various components

**Description:** Add interactive gestures with Framer Motion.

**Implementation:**

```typescript
import { motion } from 'framer-motion';
import { SPRINGS } from '@/lib/springs';

// 1. Hover + Tap gestures
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ ...SPRINGS.ripple }}
>
  Click Me
</motion.button>

// 2. Drag gesture
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}
  transition={{ ...SPRINGS.drag }}
>
  Drag Me
</motion.div>

// 3. Focus gesture
<motion.input
  whileFocus={{ scale: 1.02 }}
  transition={{ ...SPRINGS.land }}
/>

// 4. Custom gesture
<motion.div
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
  onTapStart={() => setIsTapped(true)}
  onTapCancel={() => setIsTapped(false)}
>
  Interactive Element
</motion.div>
```

**Benefits:**
- ✅ Rich interactions
- ✅ Physics-based feel
- ✅ Declarative API
- ✅ Accessible (respects prefers-reduced-motion)

**When to Use:**
- Interactive buttons
- Draggable elements
- Cards with hover effects
- Custom interactions

---

## Naming Conventions

### 7.1 Component Naming

**Pattern:** `<Adjective?><Noun><Purpose?>`

```typescript
✓ Button                  // Simple noun
✓ ProjectCreator          // Noun + purpose
✓ EnhancedPromptInput     // Adjective + noun
✓ ExecutionViewer         // Noun + purpose
✓ FogSunriseBackground    // Descriptive compound
```

### 7.2 Event Handler Naming

**Pattern:** `handle<Event>` (internal) | `on<Event>` (props)

```typescript
// Internal handlers
const handleCreate = () => { /* ... */ };
const handleSubmit = (e: FormEvent) => { /* ... */ };
const handleTaskDefinitionFocus = () => { /* ... */ };

// Prop callbacks
interface Props {
  onProjectCreated: (project: Project) => void;
  onNavigate?: (step: number) => void;
  onCSVUploaded?: (data: MappedCSV) => void;
}
```

### 7.3 State Variable Naming

**Pattern:** `[value, setValue]` or semantic names

```typescript
// Boolean state
const [isGenerating, setIsGenerating] = useState(false);
const [hasError, setHasError] = useState(false);

// Data state
const [title, setTitle] = useState('');
const [projects, setProjects] = useState<Project[]>([]);

// Computed state
const debouncedInput = useDebounce(input, 2000);
```

### 7.4 CSS Variable Naming

**Pattern:** `--<semantic-name>`

```css
✓ --background       /* Semantic color */
✓ --foreground       /* Semantic color */
✓ --primary          /* Semantic role */
✓ --radius           /* Layout property */

✗ --blue-500         /* Avoid color names */
✗ --spacing-4        /* Avoid scale values */
```

---

## Performance Patterns

### 8.1 Debouncing Pattern

**Location:** `src/hooks/useDebounce.ts`

**Implementation:**

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

// Usage: Prevent API calls on every keystroke
const debouncedInput = useDebounce(input, 2000);

useEffect(() => {
  if (!debouncedInput) return;

  async function fetchData() {
    const result = await api.search(debouncedInput);
    setResults(result);
  }

  fetchData();
}, [debouncedInput]);
```

**Benefits:**
- ✅ Reduces API calls
- ✅ Better UX (no loading flicker)
- ✅ Performance optimization
- ✅ Reusable hook

**When to Use:**
- Search inputs
- API calls triggered by input
- Expensive computations

---

## Quick Reference

### Component Patterns
| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Compound Component | Complex UI with shared state | High |
| Dual-Mode | Flexible controlled/uncontrolled | Medium |
| Slot Pattern | Semantic HTML preservation | Low |
| Data-Slot | Parent-aware styling | Medium |

### Styling Patterns
| Pattern | Use Case | Priority |
|---------|----------|----------|
| OKLCH Colors | All color definitions | High |
| CVA Variants | Components with variants | High |
| Focus Ring | All interactive elements | High |
| Error States | Form validation | Medium |

### State Patterns
| Pattern | Use Case | Scope |
|---------|----------|-------|
| Zustand | Global state | App-wide |
| Local State | UI state | Component |
| React Context | Shared component state | Feature |

### Animation Patterns
| Pattern | Use Case | Performance |
|---------|----------|-------------|
| Springs | Physics-based motion | High |
| Gestures | Interactive feedback | High |
| Layout Animations | Reordering/resizing | Medium |

---

## Conclusion

This reference document provides all the design patterns used in mino-experiments-1. Use these patterns as a foundation for building consistent, accessible, and performant components in shadcn/ui.

**Key Principles:**
1. ✅ Type safety with TypeScript
2. ✅ Accessibility first
3. ✅ Performance optimized
4. ✅ Consistent patterns
5. ✅ Developer experience

**Next Steps:**
1. Review patterns relevant to your task
2. Apply patterns consistently
3. Extend patterns as needed
4. Document new patterns

**Questions?** Refer to the codebase at `/Users/marioelysian/Documents/GitHub/mino-experiments-1` for complete implementations.
