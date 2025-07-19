# Linting Setup Documentation

## Overview

This Next.js project has been configured with a comprehensive linting and formatting setup to ensure code quality, consistency, and maintainability.

## Tools Configured

### ESLint

- **Version**: ^8.55.0
- **TypeScript ESLint**: ^7.0.0 (updated from ^6.21.0)
- **Configuration**: `.eslintrc.json`

### Prettier

- **Version**: ^3.1.1
- **Configuration**: `.prettierrc`

### Husky + lint-staged

- **Husky**: ^9.1.7 (for git hooks)
- **lint-staged**: ^15.2.11 (for pre-commit linting)

## ESLint Configuration

### Extended Configurations

- `next/core-web-vitals` - Next.js recommended rules
- `@typescript-eslint/recommended` - TypeScript recommended rules
- `@typescript-eslint/recommended-requiring-type-checking` - Stricter TypeScript rules
- `plugin:import/recommended` - Import/export best practices
- `plugin:import/typescript` - TypeScript-aware import rules
- `plugin:jsx-a11y/recommended` - Accessibility rules

### Key Plugins

- `@typescript-eslint` - TypeScript-specific linting
- `import` - Import/export validation
- `jsx-a11y` - Accessibility linting
- `unused-imports` - Automatic unused import removal

### Important Rules

#### TypeScript Rules

- `@typescript-eslint/no-explicit-any: "error"` - Prevents use of `any` type
- `@typescript-eslint/explicit-function-return-type: "error"` - Requires explicit return types
- `@typescript-eslint/consistent-type-imports: "error"` - Enforces type-only imports
- `@typescript-eslint/no-unused-vars: "error"` - Catches unused variables
- `@typescript-eslint/prefer-nullish-coalescing: "error"` - Prefers `??` over `||`

#### Code Quality Rules

- `prefer-const: "error"` - Prefers const over let when possible
- `no-var: "error"` - Disallows var declarations
- `eqeqeq: "error"` - Requires strict equality (`===`)
- `curly: "error"` - Requires curly braces for all control statements

#### Import Rules

- `import/order: "error"` - Enforces import order with alphabetical sorting
- `import/no-unused-modules: "error"` - Detects unused modules
- `import/no-cycle: "error"` - Prevents circular dependencies
- `unused-imports/no-unused-imports: "error"` - Auto-removes unused imports

#### Accessibility Rules

- `jsx-a11y/alt-text: "error"` - Requires alt text for images
- `jsx-a11y/anchor-is-valid: "error"` - Validates anchor elements
- `jsx-a11y/click-events-have-key-events: "error"` - Requires keyboard events

## Prettier Configuration

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100
}
```

## Available Scripts

### Linting Scripts

- `npm run lint` - Run ESLint on the entire project
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run lint:strict` - Run ESLint with zero warnings allowed

### Formatting Scripts

- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are properly formatted

### Combined Scripts

- `npm run check-all` - Run strict linting, format check, and unit tests

## Pre-commit Hooks

The project uses Husky and lint-staged to automatically lint and format files before commits:

### Configuration (package.json)

```json
{
	"lint-staged": {
		"*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
		"*.{json,md,css,scss}": ["prettier --write"]
	}
}
```

### Pre-commit Hook (.husky/pre-commit)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## IDE Integration

The linting rules are automatically enforced in VS Code and other IDEs that support ESLint and Prettier extensions.

## Test File Overrides

Test files have relaxed rules for better testing experience:

- `@typescript-eslint/no-explicit-any: "off"`
- `@typescript-eslint/explicit-function-return-type: "off"`
- `import/no-unused-modules: "off"`

## Configuration File Overrides

Configuration files (_.config.js, _.config.ts, \*.config.cjs) have:

- `@typescript-eslint/no-var-requires: "off"`
- `import/no-unused-modules: "off"`

## Benefits

1. **Code Quality**: Catches potential bugs and enforces best practices
2. **Consistency**: Ensures uniform code style across the project
3. **Type Safety**: Strict TypeScript rules prevent type-related errors
4. **Accessibility**: Built-in a11y checks improve user experience
5. **Maintainability**: Import organization and unused code detection
6. **Automation**: Pre-commit hooks ensure quality before commits

## Usage Examples

```bash
# Check all files for linting issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run comprehensive quality check
npm run check-all

# Format all files
npm run format
```

## Notes

- The setup uses TypeScript ESLint v7.0.0 which supports newer TypeScript versions
- All rules are configured to be errors (not warnings) for strict enforcement
- The configuration is optimized for Next.js projects with React and TypeScript
