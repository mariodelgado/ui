# Automation Scripts for Mino Pattern Implementation

**Project:** shadcn/ui v4 Enhancement
**Date:** October 15, 2025

---

## Overview

This document outlines automation scripts that can streamline the implementation and maintenance of mino design patterns in shadcn/ui v4.

---

## 1. Pattern Validator Script

### Purpose
Automatically validate that components follow mino design patterns.

### Implementation

```typescript
// scripts/validate-patterns.mts
import * as fs from "fs"
import * as path from "path"
import { Project, SyntaxKind } from "ts-morph"

interface PatternViolation {
  file: string
  component: string
  pattern: string
  message: string
  severity: "error" | "warning"
}

const REQUIRED_PATTERNS = {
  dataSlot: {
    name: "data-slot attribute",
    check: (component: string) => /data-slot=/.test(component),
    severity: "error" as const,
  },
  focusVisible: {
    name: "focus-visible ring",
    check: (component: string) =>
      /focus-visible:ring/.test(component) ||
      !/(input|button|select|textarea)/.test(component),
    severity: "error" as const,
  },
  ariaInvalid: {
    name: "aria-invalid styling",
    check: (component: string) =>
      /aria-invalid:/.test(component) ||
      !/(input|select|textarea)/.test(component),
    severity: "warning" as const,
  },
  cvaUsage: {
    name: "CVA for variants",
    check: (component: string) =>
      /from ['"]class-variance-authority['"]/.test(component) ||
      !/(variant|size)/.test(component),
    severity: "warning" as const,
  },
}

async function validatePatterns(): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = []
  const registryPath = path.join(process.cwd(), "registry/new-york-v4/ui")

  const files = fs.readdirSync(registryPath).filter((f) => f.endsWith(".tsx"))

  for (const file of files) {
    const filePath = path.join(registryPath, file)
    const content = fs.readFileSync(filePath, "utf-8")

    // Skip if not a component file
    if (!content.includes("export")) continue

    const componentName = file.replace(".tsx", "")

    // Check each pattern
    for (const [key, pattern] of Object.entries(REQUIRED_PATTERNS)) {
      if (!pattern.check(content)) {
        violations.push({
          file,
          component: componentName,
          pattern: pattern.name,
          message: `Missing ${pattern.name} in ${componentName}`,
          severity: pattern.severity,
        })
      }
    }
  }

  return violations
}

async function main() {
  console.log("🔍 Validating component patterns...\n")

  const violations = await validatePatterns()

  if (violations.length === 0) {
    console.log("✅ All components follow mino patterns!")
    process.exit(0)
  }

  // Group by severity
  const errors = violations.filter((v) => v.severity === "error")
  const warnings = violations.filter((v) => v.severity === "warning")

  if (errors.length > 0) {
    console.log("❌ Errors:\n")
    errors.forEach((v) => {
      console.log(`  ${v.file}: ${v.message}`)
    })
    console.log()
  }

  if (warnings.length > 0) {
    console.log("⚠️  Warnings:\n")
    warnings.forEach((v) => {
      console.log(`  ${v.file}: ${v.message}`)
    })
    console.log()
  }

  console.log(
    `\nTotal: ${errors.length} errors, ${warnings.length} warnings`
  )
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
```

### Usage

```bash
# Run validation
pnpm tsx scripts/validate-patterns.mts

# In CI/CD
pnpm run validate:patterns
```

### Add to package.json

```json
{
  "scripts": {
    "validate:patterns": "tsx scripts/validate-patterns.mts"
  }
}
```

---

## 2. Component Metadata Generator

### Purpose
Auto-generate metadata for registry components including props, variants, and examples.

### Implementation

```typescript
// scripts/generate-component-metadata.mts
import * as fs from "fs"
import * as path from "path"
import { Project, SyntaxKind, Node } from "ts-morph"

interface ComponentMetadata {
  name: string
  description: string
  props: PropMetadata[]
  variants: VariantMetadata[]
  examples: string[]
  patterns: string[]
}

interface PropMetadata {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

interface VariantMetadata {
  name: string
  values: string[]
  default: string
}

async function generateMetadata(componentPath: string): Promise<ComponentMetadata> {
  const project = new Project()
  const sourceFile = project.addSourceFileAtPath(componentPath)

  const componentName = path.basename(componentPath, ".tsx")
  const metadata: ComponentMetadata = {
    name: componentName,
    description: extractDescription(sourceFile),
    props: extractProps(sourceFile),
    variants: extractVariants(sourceFile),
    examples: [],
    patterns: detectPatterns(sourceFile),
  }

  return metadata
}

function extractDescription(sourceFile: any): string {
  // Extract JSDoc comment from component
  const comments = sourceFile
    .getDescendantsOfKind(SyntaxKind.JSDocComment)

  if (comments.length > 0) {
    return comments[0].getText().replace(/\/\*\*|\*\//g, "").trim()
  }

  return ""
}

function extractProps(sourceFile: any): PropMetadata[] {
  const props: PropMetadata[] = []

  // Find interface/type definitions
  const interfaces = sourceFile.getInterfaces()

  for (const iface of interfaces) {
    if (iface.getName().includes("Props")) {
      for (const prop of iface.getProperties()) {
        props.push({
          name: prop.getName(),
          type: prop.getType().getText(),
          required: !prop.hasQuestionToken(),
          default: prop.getInitializer()?.getText(),
          description: prop
            .getJsDocs()
            .map((doc) => doc.getDescription())
            .join(" "),
        })
      }
    }
  }

  return props
}

function extractVariants(sourceFile: any): VariantMetadata[] {
  const variants: VariantMetadata[] = []

  // Find CVA variant definitions
  const variantCalls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call: any) => call.getExpression().getText() === "cva")

  for (const call of variantCalls) {
    const config = call.getArguments()[1]
    if (config) {
      // Parse variants object
      const variantsObj = config
        .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
        .find((prop: any) => prop.getName() === "variants")

      if (variantsObj) {
        // Extract variant definitions
        // ... (implementation details)
      }
    }
  }

  return variants
}

function detectPatterns(sourceFile: any): string[] {
  const patterns: string[] = []
  const content = sourceFile.getFullText()

  if (/data-slot=/.test(content)) {
    patterns.push("data-slot")
  }
  if (/focus-visible:ring/.test(content)) {
    patterns.push("focus-ring")
  }
  if (/aria-invalid:/.test(content)) {
    patterns.push("error-states")
  }
  if (/from ['"]@radix-ui\/react-slot['"]/.test(content)) {
    patterns.push("slot-pattern")
  }
  if (/createContext/.test(content)) {
    patterns.push("compound-component")
  }

  return patterns
}

async function main() {
  const registryPath = path.join(process.cwd(), "registry/new-york-v4/ui")
  const outputPath = path.join(process.cwd(), "registry/__metadata__.json")

  const files = fs.readdirSync(registryPath).filter((f) => f.endsWith(".tsx"))
  const metadata: Record<string, ComponentMetadata> = {}

  console.log("🔨 Generating component metadata...\n")

  for (const file of files) {
    const filePath = path.join(registryPath, file)
    const componentMetadata = await generateMetadata(filePath)
    metadata[componentMetadata.name] = componentMetadata
    console.log(`  ✓ ${componentMetadata.name}`)
  }

  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2))

  console.log(`\n✅ Metadata generated: ${outputPath}`)
}

main()
```

### Usage

```bash
# Generate metadata
pnpm tsx scripts/generate-component-metadata.mts

# Output: registry/__metadata__.json
```

---

## 3. Animation Migration Helper

### Purpose
Help users migrate from tw-animate-css to Framer Motion.

### Implementation

```typescript
// scripts/migrate-animations.mts
import * as fs from "fs"
import * as path from "path"
import { glob } from "glob"

interface AnimationMapping {
  from: RegExp
  to: string
  description: string
}

const ANIMATION_MAPPINGS: AnimationMapping[] = [
  {
    from: /animate-in fade-in/g,
    to: 'initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRINGS.land }}',
    description: "Fade in animation",
  },
  {
    from: /animate-in zoom-in-95/g,
    to: 'initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ ...SPRINGS.land }}',
    description: "Zoom in animation",
  },
  {
    from: /animate-in slide-in-from-top/g,
    to: 'initial={{ y: -20 }} animate={{ y: 0 }} transition={{ ...SPRINGS.land }}',
    description: "Slide in from top",
  },
  {
    from: /animate-in slide-in-from-bottom/g,
    to: 'initial={{ y: 20 }} animate={{ y: 0 }} transition={{ ...SPRINGS.land }}',
    description: "Slide in from bottom",
  },
]

interface MigrationSuggestion {
  file: string
  line: number
  from: string
  to: string
  description: string
}

async function findAnimations(
  directory: string
): Promise<MigrationSuggestion[]> {
  const suggestions: MigrationSuggestion[] = []
  const files = await glob(`${directory}/**/*.{tsx,jsx}`)

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      for (const mapping of ANIMATION_MAPPINGS) {
        if (mapping.from.test(line)) {
          suggestions.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            from: line.trim(),
            to: mapping.to,
            description: mapping.description,
          })
        }
      }
    })
  }

  return suggestions
}

async function applyMigration(
  file: string,
  suggestions: MigrationSuggestion[]
): Promise<void> {
  let content = fs.readFileSync(file, "utf-8")

  for (const suggestion of suggestions) {
    for (const mapping of ANIMATION_MAPPINGS) {
      content = content.replace(mapping.from, mapping.to)
    }
  }

  // Add import if not present
  if (!content.includes('from "framer-motion"')) {
    content = `import { motion } from "framer-motion"\nimport { SPRINGS } from "@/lib/springs"\n\n${content}`
  }

  fs.writeFileSync(file, content)
}

async function main() {
  const args = process.argv.slice(2)
  const directory = args[0] || "./src"
  const autoFix = args.includes("--fix")

  console.log("🔍 Scanning for tw-animate-css usage...\n")

  const suggestions = await findAnimations(directory)

  if (suggestions.length === 0) {
    console.log("✅ No animations to migrate!")
    return
  }

  console.log(`Found ${suggestions.length} animations to migrate:\n`)

  // Group by file
  const byFile = suggestions.reduce(
    (acc, s) => {
      if (!acc[s.file]) acc[s.file] = []
      acc[s.file].push(s)
      return acc
    },
    {} as Record<string, MigrationSuggestion[]>
  )

  for (const [file, fileSuggestions] of Object.entries(byFile)) {
    console.log(`\n📄 ${file}`)
    fileSuggestions.forEach((s) => {
      console.log(`  Line ${s.line}: ${s.description}`)
      console.log(`    From: ${s.from}`)
      console.log(`    To:   <motion.div ${s.to} />`)
    })

    if (autoFix) {
      await applyMigration(file, fileSuggestions)
      console.log(`  ✅ Fixed!`)
    }
  }

  if (!autoFix) {
    console.log("\n\n💡 Run with --fix to apply changes automatically")
  }
}

main()
```

### Usage

```bash
# Scan for animations
pnpm tsx scripts/migrate-animations.mts ./src

# Apply fixes automatically
pnpm tsx scripts/migrate-animations.mts ./src --fix
```

---

## 4. Documentation Generator

### Purpose
Auto-generate MDX documentation from component source code.

### Implementation

```typescript
// scripts/generate-component-docs.mts
import * as fs from "fs"
import * as path from "path"
import { Project } from "ts-morph"

interface ComponentDocs {
  name: string
  description: string
  usage: string
  props: string
  examples: string[]
  patterns: string[]
}

async function generateDocs(componentPath: string): Promise<string> {
  const project = new Project()
  const sourceFile = project.addSourceFileAtPath(componentPath)
  const componentName = path.basename(componentPath, ".tsx")

  const docs: ComponentDocs = {
    name: componentName,
    description: extractDescription(sourceFile),
    usage: generateUsageExample(componentName),
    props: generatePropsTable(sourceFile),
    examples: extractExamples(componentName),
    patterns: detectPatterns(sourceFile),
  }

  return generateMDX(docs)
}

function generateMDX(docs: ComponentDocs): string {
  return `---
title: ${docs.name}
description: ${docs.description}
---

# ${docs.name}

${docs.description}

## Installation

\`\`\`bash
npx shadcn@latest add ${docs.name}
\`\`\`

## Usage

\`\`\`tsx
${docs.usage}
\`\`\`

## Props

${docs.props}

## Patterns

This component uses the following mino patterns:

${docs.patterns.map((p) => `- ${p}`).join("\n")}

## Examples

${docs.examples.map((e) => `### ${e}\n\n...\n\n`).join("\n")}
`
}

function generateUsageExample(componentName: string): string {
  return `import { ${componentName} } from "@/components/ui/${componentName.toLowerCase()}"

export default function Example() {
  return (
    <${componentName}>
      Content
    </${componentName}>
  )
}`
}

function generatePropsTable(sourceFile: any): string {
  // Extract props and generate markdown table
  return `| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ... | ... | ... | ... |`
}

function extractExamples(componentName: string): string[] {
  // Find example files
  return ["Basic", "With Variants", "Advanced"]
}

async function main() {
  const registryPath = path.join(process.cwd(), "registry/new-york-v4/ui")
  const docsPath = path.join(process.cwd(), "content/docs/components")

  const files = fs.readdirSync(registryPath).filter((f) => f.endsWith(".tsx"))

  console.log("📝 Generating documentation...\n")

  for (const file of files) {
    const componentPath = path.join(registryPath, file)
    const docContent = await generateDocs(componentPath)

    const componentName = file.replace(".tsx", "")
    const docPath = path.join(docsPath, `${componentName}.mdx`)

    fs.writeFileSync(docPath, docContent)
    console.log(`  ✓ ${componentName}.mdx`)
  }

  console.log("\n✅ Documentation generated!")
}

main()
```

### Usage

```bash
# Generate docs for all components
pnpm tsx scripts/generate-component-docs.mts

# Output: content/docs/components/*.mdx
```

---

## 5. Bundle Size Monitor

### Purpose
Track bundle size impact of new patterns.

### Implementation

```typescript
// scripts/analyze-bundle.mts
import { exec } from "child_process"
import { promisify } from "util"
import * as fs from "fs"

const execAsync = promisify(exec)

interface BundleAnalysis {
  total: number
  components: Record<string, number>
  dependencies: Record<string, number>
}

async function analyzeBundleSize(): Promise<BundleAnalysis> {
  console.log("📦 Analyzing bundle size...\n")

  // Build the project
  await execAsync("pnpm run build")

  // Analyze with webpack-bundle-analyzer
  const { stdout } = await execAsync("pnpm analyze")

  // Parse results
  const analysis: BundleAnalysis = {
    total: 0,
    components: {},
    dependencies: {},
  }

  // ... parse bundle stats

  return analysis
}

async function compareWithBaseline(
  analysis: BundleAnalysis
): Promise<void> {
  const baselinePath = ".bundle-baseline.json"

  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, JSON.stringify(analysis, null, 2))
    console.log("📊 Baseline created")
    return
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"))

  const diff = analysis.total - baseline.total
  const percentChange = ((diff / baseline.total) * 100).toFixed(2)

  console.log(`\nBundle size change: ${diff > 0 ? "+" : ""}${diff} bytes (${percentChange}%)`)

  if (Math.abs(parseFloat(percentChange)) > 10) {
    console.log("⚠️  Warning: Bundle size changed by more than 10%")
    process.exit(1)
  }
}

async function main() {
  const analysis = await analyzeBundleSize()
  await compareWithBaseline(analysis)
}

main()
```

### Usage

```bash
# Analyze bundle
pnpm tsx scripts/analyze-bundle.mts

# In CI/CD
pnpm run analyze:bundle
```

---

## 6. Accessibility Checker

### Purpose
Automatically check components for accessibility issues.

### Implementation

```typescript
// scripts/check-accessibility.mts
import { chromium } from "playwright"
import { injectAxe, checkA11y } from "axe-playwright"

async function checkComponentAccessibility(
  componentName: string
): Promise<void> {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Navigate to component example
  await page.goto(`http://localhost:4000/examples/${componentName}`)

  // Inject axe
  await injectAxe(page)

  // Run accessibility checks
  const violations = await checkA11y(page)

  if (violations.length > 0) {
    console.log(`\n❌ ${componentName}: ${violations.length} violations`)
    violations.forEach((v: any) => {
      console.log(`  - ${v.id}: ${v.description}`)
    })
  } else {
    console.log(`✅ ${componentName}: No accessibility issues`)
  }

  await browser.close()
}

async function main() {
  const components = ["button", "input", "select", "dialog"]

  console.log("♿ Checking accessibility...\n")

  for (const component of components) {
    await checkComponentAccessibility(component)
  }
}

main()
```

### Usage

```bash
# Check accessibility
pnpm tsx scripts/check-accessibility.mts

# In CI/CD
pnpm run check:a11y
```

---

## 7. GitHub Actions Workflows

### CI/CD Integration

```yaml
# .github/workflows/validate-patterns.yml
name: Validate Patterns

on:
  pull_request:
    paths:
      - "registry/**/*.tsx"
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm run validate:patterns
      - run: pnpm run check:a11y
      - run: pnpm run analyze:bundle

      - name: Comment PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All patterns validated!'
            })
```

---

## 8. Pre-commit Hooks

### Git Hooks Setup

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating component patterns..."
pnpm run validate:patterns

echo "🎨 Checking formatting..."
pnpm run format:check

echo "🧪 Running tests..."
pnpm run test:changed
```

### Setup

```bash
# Install husky
pnpm add -D husky

# Initialize husky
pnpm exec husky init

# Add pre-commit hook
echo "pnpm run validate:patterns" > .husky/pre-commit
```

---

## Summary

These automation scripts will:

1. ✅ Validate component patterns automatically
2. ✅ Generate component metadata for registry
3. ✅ Help users migrate animations
4. ✅ Auto-generate documentation
5. ✅ Monitor bundle size impact
6. ✅ Check accessibility automatically
7. ✅ Integrate with CI/CD
8. ✅ Run checks on every commit

### Next Steps

1. Implement scripts in order of priority:
   - Pattern validator (Week 1)
   - Animation migration helper (Week 1)
   - Accessibility checker (Week 2)
   - Documentation generator (Week 2)
   - Bundle analyzer (Week 3)
   - Metadata generator (Week 3)

2. Integrate with GitHub Actions

3. Add pre-commit hooks

4. Document usage in main README

---

**Ready to automate!** 🤖
