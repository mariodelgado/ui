# Migration Diagrams: shadcn/ui → Mino Experiments

**Visual Guide for Component and Styling Migration**

---

## Table of Contents

1. [Color System Migration](#color-system-migration)
2. [Component Architecture Comparison](#component-architecture-comparison)
3. [Styling Pattern Migration Flow](#styling-pattern-migration-flow)
4. [Animation System Comparison](#animation-system-comparison)
5. [File Organization Transformation](#file-organization-transformation)
6. [Migration Journey](#migration-journey)

---

## Color System Migration

### Diagram 1: Color System Comparison

```mermaid
graph LR
    subgraph shadcn["shadcn/ui (HSL)"]
        A1[":root<br/>--background: 0 0% 100%<br/>--foreground: 0 0% 3.9%<br/>--primary: 0 0% 9%"]
        A2[".dark<br/>--background: 0 0% 3.9%<br/>--foreground: 0 0% 98%"]
        A1 -.-> A2
    end

    subgraph mino["mino-experiments (OKLCH)"]
        B1[":root<br/>--background: oklch(1 0 0)<br/>--foreground: oklch(0.145 0 0)<br/>--primary: oklch(0.205 0 0)"]
        B2[".dark<br/>--background: oklch(0.145 0 0)<br/>--border: oklch(1 0 0 / 10%)<br/>--input: oklch(1 0 0 / 15%)"]
        B1 -.-> B2
    end

    shadcn -->|Migration| mino

    style shadcn fill:#f0f0f0,stroke:#666,stroke-width:2px
    style mino fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    style A1 fill:#fff,stroke:#999
    style A2 fill:#333,stroke:#999,color:#fff
    style B1 fill:#fff,stroke:#4caf50
    style B2 fill:#1a1a1a,stroke:#4caf50,color:#fff
```

### Diagram 2: OKLCH Benefits

```mermaid
mindmap
  root((OKLCH Benefits))
    Perceptual Uniformity
      Equal lightness values appear equally bright
      Better color interpolation
      Consistent contrast
    Opacity Support
      Transparent borders in dark mode
      oklch(1 0 0 / 10%) for borders
      oklch(1 0 0 / 15%) for inputs
    Future Proof
      Wide color gamut support
      HDR display ready
      CSS Color Level 4 spec
    Developer Experience
      Intuitive lightness parameter
      0 to 1 scale clear
      Easier to adjust
```

### Diagram 3: Color Mapping Table

```mermaid
graph TB
    subgraph HSL["HSL Values (shadcn)"]
        H1["0 0% 100% → White"]
        H2["0 0% 3.9% → Dark Gray"]
        H3["0 0% 98% → Light Gray"]
        H4["0 0% 14.9% → Border Dark"]
    end

    subgraph OKLCH["OKLCH Values (mino)"]
        O1["oklch(1 0 0) → White"]
        O2["oklch(0.145 0 0) → Dark Gray"]
        O3["oklch(0.985 0 0) → Light Gray"]
        O4["oklch(1 0 0 / 10%) → Transparent Border"]
    end

    H1 -->|Convert| O1
    H2 -->|Convert| O2
    H3 -->|Convert| O3
    H4 -->|Enhance| O4

    style HSL fill:#e3f2fd,stroke:#2196f3
    style OKLCH fill:#e8f5e9,stroke:#4caf50
```

---

## Component Architecture Comparison

### Diagram 4: Component Evolution

```mermaid
graph TD
    A[Simple Component<br/>shadcn/ui] --> B{Need Composition?}
    B -->|No| C[Keep Simple<br/>Button, Input]
    B -->|Yes| D[Compound Component<br/>InputGroup, PromptInput]

    C --> E[Add data-slot attribute]
    D --> F[Add data-slot + Context]

    E --> G[Enhanced Component]
    F --> G

    style A fill:#e3f2fd,stroke:#2196f3
    style D fill:#fff3e0,stroke:#ff9800
    style G fill:#e8f5e9,stroke:#4caf50
```

### Diagram 5: InputGroup Architecture

```mermaid
classDiagram
    class InputGroup {
        +align: 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
        +className: string
        +children: ReactNode
        +render() ReactElement
    }

    class InputGroupControl {
        +children: ReactNode
        +className: string
        +render() ReactElement
    }

    class InputGroupAddon {
        +size: 'xs' | 'sm' | 'default'
        +children: ReactNode
        +className: string
        +render() ReactElement
    }

    class InputGroupTextarea {
        +placeholder: string
        +value: string
        +onChange: Function
        +render() ReactElement
    }

    InputGroup *-- InputGroupControl
    InputGroup *-- InputGroupAddon
    InputGroup *-- InputGroupTextarea

    InputGroupControl o-- Input
    InputGroupControl o-- InputGroupTextarea
    InputGroupAddon o-- Button
```

### Diagram 6: Component State Flow

```mermaid
sequenceDiagram
    participant User
    participant InputGroup
    participant Control
    participant Input
    participant Addon

    User->>InputGroup: Focus input
    InputGroup->>Control: Update data-focus
    Control->>Input: Apply focus styles
    InputGroup->>Addon: Detect has-[>input:focus]
    Addon->>Addon: Apply parent-aware styles

    User->>Input: Type value
    Input->>Control: Emit change event
    Control->>InputGroup: Propagate state
    InputGroup->>InputGroup: Update data-has-value

    Note over InputGroup,Addon: Parent-aware styling via CSS has-[]
```

---

## Styling Pattern Migration Flow

### Diagram 7: CVA Pattern Evolution

```mermaid
flowchart TD
    Start[Existing CVA Button] --> Check{Needs Enhancement?}

    Check -->|No| Keep[Keep Current CVA]
    Check -->|Yes| Enhance[Add Enhanced Base Classes]

    Enhance --> Focus[Add Focus Ring<br/>focus-visible:ring-[3px]]
    Focus --> ARIA[Add ARIA Styles<br/>aria-invalid:ring-destructive]
    ARIA --> SVG[Add SVG Handling<br/>[&_svg]:size-4]
    SVG --> Has[Add Has Variants<br/>has-[>svg]:px-3]
    Has --> Dark[Add Dark Mode<br/>dark:bg-input/30]

    Dark --> Test{Test Component}
    Test -->|Pass| Done[✅ Migration Complete]
    Test -->|Fail| Debug[Debug & Fix]
    Debug --> Test

    style Start fill:#e3f2fd,stroke:#2196f3
    style Done fill:#e8f5e9,stroke:#4caf50
    style Debug fill:#ffebee,stroke:#f44336
```

### Diagram 8: Migration Timeline

```mermaid
gantt
    title Component Migration Timeline
    dateFormat YYYY-MM-DD
    section Foundation
    Install Dependencies           :done, 2025-01-01, 2d
    Update CSS Variables          :done, 2025-01-03, 2d
    Create Springs Config         :done, 2025-01-05, 1d

    section Components
    Migrate Button                :active, 2025-01-06, 2d
    Migrate Input                 :2025-01-08, 2d
    Create InputGroup             :2025-01-10, 3d
    Migrate Select                :2025-01-13, 2d

    section Styling
    Add Focus Rings               :2025-01-15, 2d
    Add ARIA States               :2025-01-17, 2d
    Implement Shadows             :2025-01-19, 1d

    section Animation
    Convert to Framer Motion      :2025-01-20, 3d
    Implement Springs             :2025-01-23, 2d
    Add Gestures                  :2025-01-25, 2d

    section Testing
    Visual Regression             :2025-01-27, 3d
    Accessibility Audit           :2025-01-30, 2d
```

---

## Animation System Comparison

### Diagram 9: Animation Architecture

```mermaid
graph TB
    subgraph shadcn["shadcn/ui Animation"]
        A1[Tailwind CSS]
        A2[tailwindcss-animate plugin]
        A3[data-state attributes]
        A4[CSS animations]

        A1 --> A2
        A2 --> A3
        A3 --> A4
    end

    subgraph mino["mino Animation System"]
        B1[Framer Motion v12]
        B2[Spring Physics]
        B3[Gesture Support]
        B4[Layout Animations]
        B5[Custom Springs Config]

        B1 --> B2
        B1 --> B3
        B1 --> B4
        B2 --> B5
    end

    shadcn -.Migration.-> mino

    style shadcn fill:#e3f2fd,stroke:#2196f3
    style mino fill:#e8f5e9,stroke:#4caf50
```

### Diagram 10: Animation Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant FramerMotion
    participant SpringPhysics
    participant GPU

    User->>Component: Trigger animation
    Component->>FramerMotion: Pass animation config
    FramerMotion->>SpringPhysics: Calculate spring values
    SpringPhysics->>SpringPhysics: Compute position<br/>(stiffness: 400, damping: 28)

    loop Every frame (60fps)
        SpringPhysics->>FramerMotion: Return new value
        FramerMotion->>GPU: Apply transform/opacity
        GPU->>User: Render frame
    end

    SpringPhysics->>FramerMotion: Animation complete
    FramerMotion->>Component: Trigger onAnimationComplete
```

### Diagram 11: Animation Migration Decision Tree

```mermaid
flowchart TD
    Start[Component with Animation] --> Type{Animation Type?}

    Type -->|Simple fade/slide| Tailwind[Keep Tailwind Animate]
    Type -->|Complex/Interactive| Framer[Use Framer Motion]

    Framer --> Spring{Needs Physics?}
    Spring -->|Yes| UseSpring[Use SPRINGS.land/drag/ripple]
    Spring -->|No| UseTransition[Use basic transition]

    Framer --> Gesture{Needs Gestures?}
    Gesture -->|Yes| UseGesture[Add whileHover/whileTap/drag]
    Gesture -->|No| NoGesture[Skip gestures]

    Framer --> Layout{Needs Layout Animation?}
    Layout -->|Yes| UseLayout[Add layout prop]
    Layout -->|No| NoLayout[Skip layout]

    UseSpring --> Done
    UseTransition --> Done
    UseGesture --> Done
    NoGesture --> Done
    UseLayout --> Done
    NoLayout --> Done
    Tailwind --> Done[✅ Complete]

    style Start fill:#e3f2fd,stroke:#2196f3
    style Done fill:#e8f5e9,stroke:#4caf50
```

### Diagram 12: Spring Configuration Examples

```mermaid
graph LR
    subgraph Springs["Spring Configurations"]
        S1["land<br/>stiffness: 400<br/>damping: 28<br/>mass: 0.8"]
        S2["drag<br/>stiffness: 340<br/>damping: 26<br/>mass: 0.9"]
        S3["ripple<br/>stiffness: 450<br/>damping: 45<br/>mass: 0.7"]
    end

    subgraph UseCases["Use Cases"]
        U1["Page transitions<br/>Modal open/close<br/>Card appearances"]
        U2["Draggable elements<br/>Sliders<br/>Resizable panels"]
        U3["Click feedback<br/>Button press<br/>Expanding elements"]
    end

    S1 --> U1
    S2 --> U2
    S3 --> U3

    style Springs fill:#fff3e0,stroke:#ff9800
    style UseCases fill:#e8f5e9,stroke:#4caf50
```

---

## File Organization Transformation

### Diagram 13: Directory Structure Evolution

```mermaid
graph TD
    subgraph Before["shadcn/ui (Flat Structure)"]
        A1[components/ui/]
        A2[button.tsx]
        A3[input.tsx]
        A4[select.tsx]
        A5[dropdown-menu.tsx]
        A6[... 50+ components]

        A1 --> A2
        A1 --> A3
        A1 --> A4
        A1 --> A5
        A1 --> A6
    end

    subgraph After["mino (Feature-Based)"]
        B1[components/]
        B2[ui/]
        B3[ai-elements/]
        B4[execution/]
        B5[learning/]
        B6[monitoring/]
        B7[eval/]
        B8[gallery/]
        B9[backgrounds/]

        B1 --> B2
        B1 --> B3
        B1 --> B4
        B1 --> B5
        B1 --> B6
        B1 --> B7
        B1 --> B8
        B1 --> B9

        B2 -.Base components.-> B10[button.tsx<br/>input.tsx<br/>input-group.tsx]
        B3 -.AI features.-> B11[prompt-input.tsx<br/>context-viewer.tsx]
        B4 -.Execution.-> B12[ExecutionViewer.tsx<br/>ProgressTracker.tsx]
    end

    Before -.Migration.-> After

    style Before fill:#e3f2fd,stroke:#2196f3
    style After fill:#e8f5e9,stroke:#4caf50
```

### Diagram 14: Component Categorization

```mermaid
mindmap
  root((Components))
    Base UI
      button.tsx
      input.tsx
      input-group.tsx
      select.tsx
      textarea.tsx
      tooltip.tsx
      dropdown-menu.tsx
    AI Elements
      prompt-input.tsx
      EnhancedPromptInput.tsx
      context-viewer.tsx
    Execution
      ExecutionViewer.tsx
      ProgressTracker.tsx
      ExecutionStats.tsx
      ErrorList.tsx
      ResultsTable.tsx
    Learning
      FeedbackForm.tsx
      LearningDashboard.tsx
    Monitoring
      MonitoringDashboard.tsx
      MetricsChart.tsx
    Evaluation
      EvaluationRunner.tsx
      ResultsViewer.tsx
    Gallery
      ProjectGallery.tsx
      ProjectCard.tsx
    Backgrounds
      FogSunriseBackground.tsx
```

### Diagram 15: Migration Workflow

```mermaid
flowchart TD
    Start[Start Migration] --> Backup[Create Backup Branch]
    Backup --> Analyze[Analyze Component Dependencies]

    Analyze --> Categorize{Categorize Component}

    Categorize -->|Base UI| KeepUI[Keep in components/ui/]
    Categorize -->|Feature Specific| MoveFeature[Move to feature folder]
    Categorize -->|AI Related| MoveAI[Move to ai-elements/]

    KeepUI --> UpdateImports
    MoveFeature --> UpdateImports
    MoveAI --> UpdateImports

    UpdateImports[Update All Imports] --> Test{Tests Pass?}

    Test -->|No| Debug[Debug Import Issues]
    Debug --> UpdateImports

    Test -->|Yes| Verify[Verify No Broken Imports]
    Verify --> Commit[Commit Changes]
    Commit --> Next{More Components?}

    Next -->|Yes| Analyze
    Next -->|No| Done[✅ Migration Complete]

    style Start fill:#e3f2fd,stroke:#2196f3
    style Done fill:#e8f5e9,stroke:#4caf50
    style Debug fill:#ffebee,stroke:#f44336
```

### Diagram 16: Import Path Updates

```mermaid
graph LR
    subgraph Old["Before (shadcn)"]
        O1["import { Button } from '@/components/ui/button'"]
        O2["import { Input } from '@/components/ui/input'"]
        O3["import { Select } from '@/components/ui/select'"]
    end

    subgraph New["After (mino)"]
        N1["import { Button } from '@/components/ui/button'<br/>(stays the same)"]
        N2["import { ExecutionViewer } from '@/components/execution/ExecutionViewer'"]
        N3["import { PromptInput } from '@/components/ai-elements/prompt-input'"]
    end

    O1 -->|No change| N1
    O2 -->|Feature-based| N2
    O3 -->|Feature-based| N3

    style Old fill:#e3f2fd,stroke:#2196f3
    style New fill:#e8f5e9,stroke:#4caf50
```

---

## Migration Journey

### Diagram 17: Developer Experience Journey

```mermaid
journey
    title Migration Experience Journey
    section Setup (Week 1)
      Install dependencies: 3: Developer
      Update CSS variables: 4: Developer
      Create configs: 5: Developer
    section Components (Week 2-3)
      Migrate Button: 5: Developer
      Migrate Input: 4: Developer
      Create InputGroup: 3: Developer
      Complex components: 2: Developer
    section Styling (Week 3)
      Add focus rings: 5: Developer
      ARIA states: 4: Developer
      Dark mode polish: 5: Developer
    section Animation (Week 3-4)
      Convert animations: 3: Developer
      Spring physics: 4: Developer
      Gesture support: 5: Developer
    section Testing (Week 4-5)
      Visual regression: 4: Developer
      Accessibility audit: 5: Developer
      Performance: 4: Developer
    section Launch (Week 5-6)
      Documentation: 3: Developer
      Team training: 4: Developer
      Production deploy: 5: Developer
```

### Diagram 18: Complexity vs Impact

```mermaid
quadrantChart
    title Migration Task Prioritization
    x-axis Low Complexity --> High Complexity
    y-axis Low Impact --> High Impact
    quadrant-1 Do Last
    quadrant-2 Do First
    quadrant-3 Optional
    quadrant-4 Do Second

    Color System: [0.3, 0.9]
    Base Components: [0.4, 0.85]
    Focus Rings: [0.2, 0.8]
    InputGroup: [0.6, 0.75]
    Framer Motion: [0.7, 0.8]
    Spring Config: [0.3, 0.6]
    File Organization: [0.5, 0.7]
    Complex Compounds: [0.9, 0.7]
    Dark Mode Polish: [0.4, 0.65]
    Animation Convert: [0.6, 0.6]
    ARIA States: [0.3, 0.7]
    Gestures: [0.5, 0.5]
    Layout Animations: [0.8, 0.5]
    Documentation: [0.4, 0.4]
```

### Diagram 19: Technology Stack

```mermaid
graph TB
    subgraph Common["Common Base (Both)"]
        C1[React 18+]
        C2[TypeScript]
        C3[Tailwind CSS]
        C4[Radix UI]
        C5[CVA]
    end

    subgraph shadcn["shadcn/ui Specific"]
        S1[tailwindcss-animate]
        S2[HSL Colors]
        S3[Flat Structure]
    end

    subgraph mino["mino Enhancements"]
        M1[Framer Motion v12]
        M2[OKLCH Colors]
        M3[Feature Structure]
        M4[Spring Physics]
        M5[Compound Patterns]
        M6[data-slot Attributes]
    end

    Common --> shadcn
    Common --> mino

    style Common fill:#f5f5f5,stroke:#666
    style shadcn fill:#e3f2fd,stroke:#2196f3
    style mino fill:#e8f5e9,stroke:#4caf50
```

### Diagram 20: Migration Checklist

```mermaid
flowchart TD
    Start([Start Migration]) --> P1{Phase 1: Foundation}

    P1 -->|✅| P1A[Install dependencies]
    P1A --> P1B[Update CSS variables]
    P1B --> P1C[Create spring config]
    P1C --> P1D[Update Tailwind config]

    P1D --> P2{Phase 2: Components}

    P2 -->|✅| P2A[Migrate Button]
    P2A --> P2B[Migrate Input]
    P2B --> P2C[Create InputGroup]
    P2C --> P2D[Migrate Select]
    P2D --> P2E[Add data-slot to all]

    P2E --> P3{Phase 3: Styling}

    P3 -->|✅| P3A[Add focus rings]
    P3A --> P3B[Add ARIA states]
    P3B --> P3C[Implement shadows]
    P3C --> P3D[Dark mode opacity]

    P3D --> P4{Phase 4: Animation}

    P4 -->|✅| P4A[Convert to Framer Motion]
    P4A --> P4B[Implement springs]
    P4B --> P4C[Add gestures]
    P4C --> P4D[Layout animations]

    P4D --> P5{Phase 5: Organization}

    P5 -->|✅| P5A[Create feature folders]
    P5A --> P5B[Move components]
    P5B --> P5C[Update imports]

    P5C --> P6{Phase 6: Testing}

    P6 -->|✅| P6A[Visual regression]
    P6A --> P6B[Accessibility audit]
    P6B --> P6C[Performance test]

    P6C --> Complete([✅ Migration Complete])

    style Start fill:#e3f2fd,stroke:#2196f3
    style Complete fill:#e8f5e9,stroke:#4caf50
```

---

## Rendering These Diagrams

### In GitHub
These Mermaid diagrams render natively in GitHub markdown files.

### In VS Code
Install the "Markdown Preview Mermaid Support" extension.

### Online
Use [Mermaid Live Editor](https://mermaid.live) to edit and preview.

### In Documentation Sites
Most modern documentation platforms (Docusaurus, GitBook, VitePress) support Mermaid natively.

---

## Diagram Legend

**Colors:**
- 🔵 Blue: shadcn/ui original state
- 🟢 Green: mino-experiments target state
- 🟠 Orange: In-progress/transition state
- 🔴 Red: Error/debug state
- ⚪ Gray: Neutral/common elements

**Diagram Types:**
- **Flowchart**: Process flows and decision trees
- **Graph**: System architecture and relationships
- **Class Diagram**: Component structure
- **Sequence Diagram**: Interaction flows
- **Gantt Chart**: Timeline planning
- **Journey Diagram**: Experience mapping
- **Mindmap**: Categorization
- **Quadrant Chart**: Prioritization

---

## Next Steps

1. Review each diagram section
2. Use diagrams during team discussions
3. Reference during implementation
4. Update diagrams as patterns evolve
5. Add custom diagrams for project-specific patterns

**Happy migrating!** 🚀
