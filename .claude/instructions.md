# Project Instructions for Claude Code

## Code Language

- All code, comments, and documentation in code files MUST be in English
- Variable names, function names, and class names MUST be in English
- Test descriptions (describe/it blocks) MUST be in English
- Commit messages MUST be in English

## Conversation Language

- You may converse with the user in their preferred language (e.g., Swedish)
- But always write code and comments in English regardless of conversation language

## Code Style and Formatting

This project uses the following tools to ensure consistent code style:

- **ESLint** - for code quality and best practices (see `eslint.config.js`)
- **Prettier** - for code formatting (see `.prettierrc`)
- **EditorConfig** - for editor settings (see `.editorconfig`)
- **Husky + lint-staged** - runs linting on pre-commit

### Key Style Rules

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- No trailing commas
- 100 character line width
- Use `const` and `let`, never `var`
- Use arrow functions where appropriate
- Always use strict equality (`===`)

### Before Committing

Run these commands to ensure code quality:

```bash
npm run lint        # Check for ESLint issues
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format with Prettier
npm run test:run    # Run tests
```

Pre-commit hooks will automatically run lint-staged on staged files.

## Git Workflow

This project uses Git Flow:

- `main` - production-ready code
- `dev` - integration/test branch
- `feature/*` - feature branches (branch from dev, merge to dev)

## Before Starting Any Coding

Ask the user about:

1. Code style preferences (linting, formatting)
2. Testing requirements
3. Documentation standards
4. Git workflow (branch naming, commit conventions)
