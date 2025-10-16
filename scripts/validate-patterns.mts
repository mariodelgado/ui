#!/usr/bin/env tsx

/**
 * Pattern Validation Script
 *
 * Validates that all UI components follow the mino design patterns:
 * - data-slot attributes for component identification
 * - focus-visible rings for keyboard navigation
 * - aria-invalid styling for form validation
 * - CVA usage for components with variants
 *
 * Usage:
 *   pnpm tsx scripts/validate-patterns.mts
 *   pnpm tsx scripts/validate-patterns.mts --fix
 */

import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface PatternViolation {
  file: string
  component: string
  pattern: string
  message: string
  severity: "error" | "warning"
  line?: number
}

interface PatternCheck {
  name: string
  check: (content: string, file: string) => boolean
  severity: "error" | "warning"
  description: string
  autoFix?: (content: string) => string
}

const INTERACTIVE_ELEMENTS = [
  "button",
  "input",
  "select",
  "textarea",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "toggle",
]

const FORM_ELEMENTS = ["input", "select", "textarea"]

const PATTERN_CHECKS: PatternCheck[] = [
  {
    name: "data-slot",
    severity: "error",
    description: "All components should have data-slot attribute",
    check: (content, file) => {
      // Skip non-component files
      if (!content.includes("export")) return true

      // Check if it's an interactive component
      const isInteractive = INTERACTIVE_ELEMENTS.some((el) =>
        file.includes(el)
      )

      if (!isInteractive) return true

      // Check for data-slot attribute
      return /data-slot=/.test(content)
    },
  },
  {
    name: "focus-visible-ring",
    severity: "error",
    description: "Interactive elements should have focus-visible rings",
    check: (content, file) => {
      const isInteractive = INTERACTIVE_ELEMENTS.some((el) =>
        file.includes(el)
      )

      if (!isInteractive) return true

      // Check for focus-visible ring classes
      return (
        /focus-visible:ring/.test(content) ||
        /focus-visible:border-ring/.test(content)
      )
    },
  },
  {
    name: "aria-invalid-styling",
    severity: "warning",
    description: "Form elements should have aria-invalid styling",
    check: (content, file) => {
      const isFormElement = FORM_ELEMENTS.some((el) => file.includes(el))

      if (!isFormElement) return true

      // Check for aria-invalid styling
      return /aria-invalid:/.test(content)
    },
  },
  {
    name: "cva-usage",
    severity: "warning",
    description: "Components with variants should use CVA",
    check: (content, file) => {
      // Check if component has variant props
      const hasVariants =
        /variant[:?]/.test(content) || /size[:?]/.test(content)

      if (!hasVariants) return true

      // Check if CVA is imported and used
      return (
        /from ['"]class-variance-authority['"]/.test(content) &&
        /cva\(/.test(content)
      )
    },
  },
  {
    name: "typescript-types",
    severity: "error",
    description: "Components should have proper TypeScript types",
    check: (content, file) => {
      if (!file.endsWith(".tsx")) return true

      // Check for component props types
      const hasFunction = /function|const.*=.*=>/.test(content)
      if (!hasFunction) return true

      // Should have either interface or type for props
      return (
        /interface.*Props/.test(content) || /type.*Props/.test(content)
      )
    },
  },
]

function findComponentFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...findComponentFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return files
}

function validateFile(filePath: string): PatternViolation[] {
  const violations: PatternViolation[] = []

  try {
    const content = fs.readFileSync(filePath, "utf-8")
    const fileName = path.basename(filePath)
    const componentName = fileName.replace(".tsx", "")

    // Skip if not a component file (no exports)
    if (!content.includes("export")) return violations

    for (const check of PATTERN_CHECKS) {
      if (!check.check(content, fileName)) {
        violations.push({
          file: fileName,
          component: componentName,
          pattern: check.name,
          message: `${check.description}`,
          severity: check.severity,
        })
      }
    }
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error)
  }

  return violations
}

function formatViolations(violations: PatternViolation[]): string {
  if (violations.length === 0) {
    return "✅ No violations found!"
  }

  const errors = violations.filter((v) => v.severity === "error")
  const warnings = violations.filter((v) => v.severity === "warning")

  let output = ""

  if (errors.length > 0) {
    output += "❌ Errors:\n\n"
    errors.forEach((v) => {
      output += `  ${v.file}\n`
      output += `    ${v.pattern}: ${v.message}\n\n`
    })
  }

  if (warnings.length > 0) {
    output += "⚠️  Warnings:\n\n"
    warnings.forEach((v) => {
      output += `  ${v.file}\n`
      output += `    ${v.pattern}: ${v.message}\n\n`
    })
  }

  output += `\nTotal: ${errors.length} error(s), ${warnings.length} warning(s)\n`

  return output
}

function generateReport(violations: PatternViolation[]): void {
  const report = {
    timestamp: new Date().toISOString(),
    totalViolations: violations.length,
    errors: violations.filter((v) => v.severity === "error").length,
    warnings: violations.filter((v) => v.severity === "warning").length,
    violations: violations,
  }

  const reportPath = path.join(process.cwd(), ".pattern-validation-report.json")
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`\n📊 Report saved to: ${reportPath}`)
}

async function main() {
  const args = process.argv.slice(2)
  const shouldFix = args.includes("--fix")
  const generateReportFlag = args.includes("--report")

  console.log("🔍 Validating component patterns...\n")

  // Find registry paths
  const registryPath = path.join(
    process.cwd(),
    "apps/v4/registry/new-york-v4/ui"
  )

  if (!fs.existsSync(registryPath)) {
    console.error(`❌ Registry path not found: ${registryPath}`)
    process.exit(1)
  }

  // Find all component files
  const componentFiles = findComponentFiles(registryPath)
  console.log(`Found ${componentFiles.length} component files\n`)

  // Validate each file
  const allViolations: PatternViolation[] = []

  for (const file of componentFiles) {
    const violations = validateFile(file)
    allViolations.push(...violations)
  }

  // Format and display results
  const output = formatViolations(allViolations)
  console.log(output)

  // Generate report if requested
  if (generateReportFlag) {
    generateReport(allViolations)
  }

  // Summary
  const errors = allViolations.filter((v) => v.severity === "error").length
  const warnings = allViolations.filter((v) => v.severity === "warning").length

  if (errors === 0 && warnings === 0) {
    console.log("✨ All components follow mino design patterns!")
    process.exit(0)
  }

  if (errors > 0) {
    console.log("\n💡 Tip: Review the MINO_DESIGN_PATTERNS_REFERENCE.md for guidance")
    process.exit(1)
  }

  // Only warnings
  console.log("\n✅ No errors, but please review warnings")
  process.exit(0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
