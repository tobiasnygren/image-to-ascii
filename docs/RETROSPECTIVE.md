# Retrospective: AI-Assisted Development with Claude Code

This document captures lessons learned from building the image-to-ascii project in collaboration with Claude Code.

## What Went Well

- **Discussing before coding** - Taking time to discuss the idea and tech stack saved rework later
- **Asking for explanations** - Claude explained each step, making the code understandable
- **Frequent commits** - Small, focused commits gave confidence and clear history
- **Early testing** - Writing tests alongside code caught issues quickly
- **Questioning security** - Pushing back on "dev mode without auth" led to a better solution (mandatory API key)

## What Could Have Been Better

We moved too quickly from idea to implementation. This caused us to miss:

### 1. Code Language

Comments and some variable names ended up in Swedish because the conversation was in Swedish. Should have clarified before coding:

- Code and comments should be in English
- Conversation can be in any language

### 2. Linting and Formatting

No ESLint or Prettier was configured. Should have been part of initial setup:

- Linting rules
- Code formatting
- Pre-commit hooks

### 3. Process Documentation

Could have documented more along the way:

- Decisions and alternatives considered
- Why certain approaches were chosen/rejected
- More detailed commit messages

## Tips for Future Projects with Claude Code

To avoid these issues, be explicit upfront:

### 1. Ask Claude to Clarify First

> "Before we start coding, ask me questions about code standards, language, and project conventions."

### 2. Request a Project Setup Document

> "Create a checklist of project conventions for me to approve before we start coding."

The document should cover:

- [ ] Language for code and comments
- [ ] Linting and formatting tools
- [ ] Commit message conventions
- [ ] Testing strategy
- [ ] Documentation requirements
- [ ] Git workflow (branches, PRs)

### 3. Use Plan Mode

Start with `/plan` or ask for "plan mode" to explore and design before implementation. This gives you a chance to review the approach before any code is written.

### 4. Set Expectations for Pace

> "I want to understand each step. Explain what you're doing and wait for my OK before proceeding."

## Technical Learnings

### Image Processing in Node.js

- **Sharp is powerful** - `.greyscale().resize().raw()` gives you pixel data easily
- **Sharp is fast** - Surprisingly performant, makes Cloudflare Workers deployment realistic
- **Character aspect ratio** - Terminal characters are ~2x taller than wide, so height must be adjusted
- **Programmatic test images** - Creating test images with code (gradients, shapes) makes tests reproducible
- **Brightness mapping is elegant** - Simple concept: pixel value (0-255) → index in character list → character. No AI or edge detection needed.

### Areas for Improvement

- **Contrast handling** - Real-world images often lack contrast for clear ASCII output. Could add `sharp.normalize()` or `sharp.linear()` to stretch brightness range before conversion.
- **Worth exploring** - Sharp has many more features worth learning (image manipulation, format conversion, metadata)

### Hono Framework

- Lightweight alternative to Express
- Easy to test without starting the server (`app.request()`)
- Works across Node, Bun, Cloudflare Workers
- Surprisingly fast - good fit for serverless

### Dependencies

- **Fewer than expected** - Only needed Hono, Sharp, and Vitest. No bloat.

### Security Considerations

- Never have an "open by default" mode, even for development
- Validate inputs at the boundary (file size, width parameter)
- Return generic error messages to clients

## Overall Result

**Verdict: Successful for a test project.**

What we built:

- Working API that converts images to ASCII art
- Authentication and input validation
- Comprehensive test suite (21 tests)
- Documentation of process and decisions

The main gap was **planning before coding** - establishing conventions (code language, linting, documentation standards) upfront would have saved rework and produced a cleaner result.

Despite this, the project achieved its goals:

- Explored AI-assisted development with Claude Code
- Learned about image processing in Node.js
- Built something functional and fun

## Action Items for Next Iteration

If we continue this project:

- [x] Convert code comments to English (completed)
- [x] Add .claude/instructions.md to prevent language issues in future (completed)
- [x] Add ESLint + Prettier (completed)
- [x] Add pre-commit hooks (completed)
- [ ] Consider adding rate limiting
- [ ] Build a simple web UI

---

_This retrospective was written as part of exploring AI-assisted development with Claude Code._
