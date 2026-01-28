# Project Plan: image-to-ascii

## Background

This project was created as a test project to explore collaboration between a developer and Claude Code. The idea came over morning coffee: build a simple web service that converts images to ASCII art.

## Goals

Build a lightweight API that:

1. Receives an uploaded image (any format)
2. Converts the image to grayscale
3. Generates ASCII representation of the image
4. Returns the ASCII art as text

## Technical Decisions

### Frameworks and Libraries

| Package           | Version | Purpose                   |
| ----------------- | ------- | ------------------------- |
| hono              | ^4.0.0  | Lightweight web framework |
| @hono/node-server | ^1.8.0  | Node.js adapter for Hono  |
| sharp             | ^0.33.0 | Image processing          |
| vitest            | ^1.0.0  | Test framework            |

### Why These Choices?

- **Hono** instead of Express: Lightweight (3kb), works in Node, Bun, Cloudflare Workers, AWS Lambda. Enables future CLI tools or serverless deployment without rewriting.
- **Sharp**: Fast image processing via libvips. Handles most image formats, grayscale conversion, and pixel access.
- **Vitest**: Modern, fast test framework with good DX.

## Project Structure

```
image-to-ascii/
├── src/
│   ├── index.js          # API server with Hono, security
│   ├── app.js            # Hono application (separated for testing)
│   ├── converter.js      # Image → ASCII logic
│   └── charsets.js       # ASCII character sets
├── test/
│   ├── api.test.js          # API tests (11 tests)
│   ├── converter.test.js    # Unit tests (10 tests)
│   ├── create-test-image.js # Generates test images programmatically
│   └── fixtures/            # Test images (gradient, circle, etc.)
├── docs/
│   ├── PLAN.md              # This file
│   └── RETROSPECTIVE.md     # Lessons learned
├── .claude/
│   └── instructions.md      # Instructions for Claude Code
├── .env.example          # Template for environment variables
├── package.json
├── .gitignore
└── README.md
```

## Git Workflow

We use Git Flow:

```
main     ← Production-ready code
  │
  └── dev     ← Integration/test
        │
        └── feature/*  ← Development
```

- Development happens in feature branches
- Merge to `dev` for integration/testing
- Merge to `main` when stable

## API Specification

### GET /

Health check - returns API information. Open endpoint.

**Response (200):**

```json
{
  "name": "image-to-ascii",
  "version": "0.1.0",
  "endpoints": { "convert": "POST /convert (requires X-API-Key header)" },
  "limits": { "maxFileSize": "10 MB", "widthRange": "20-200 characters" }
}
```

### POST /convert

Converts an uploaded image to ASCII. **Requires authentication.**

**Headers:**

```
X-API-Key: your-api-key
```

**Request:**

```
Content-Type: multipart/form-data

Body:
  - image: [image file, max 10 MB]

Query parameters (optional):
  - width: number of characters wide, 20-200 (default: 80)
```

**Response (200):**

```json
{
  "ascii": "@@@@....####\n@@@@....####\n...",
  "width": 80
}
```

**Response (400):**

```json
{
  "error": "No image provided. Send a file as \"image\" in multipart/form-data."
}
```

**Response (401):**

```json
{
  "error": "Missing API key. Provide it in X-API-Key header."
}
```

## Security

### Principles

- **No insecure defaults** - Server refuses to start without `API_KEY` environment variable
- **Fail closed** - Missing/incorrect key returns 401, not open access

### Implemented Protections

| Protection             | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| API key (mandatory)    | `X-API-Key` header required, server won't start without `API_KEY` |
| Timing-safe comparison | Uses `crypto.timingSafeEqual()` to prevent timing attacks         |
| File size              | Max 10 MB per upload                                              |
| Width limits           | 20-200 characters, values outside are adjusted automatically      |
| Error messages         | Generic to client, detailed in server logs                        |

### Not Implemented (recommended for production)

| Protection    | Recommendation                               |
| ------------- | -------------------------------------------- |
| Rate limiting | Implement at proxy level (nginx, Cloudflare) |
| HTTPS         | Run behind reverse proxy with TLS            |
| Logging       | Add structured logging for monitoring        |

## Implementation Steps

- [x] Setup - Initialize project, install dependencies
- [x] Converter module - Core: image buffer → ASCII string
- [x] API endpoint - POST /convert
- [x] Tests - Unit tests for converter (10 tests) + API tests (11 tests)
- [x] Security - API key, file limits, input validation
- [x] Documentation - README with instructions
- [x] Code review - Address GitHub Copilot feedback
- [x] Translation - Translate all Swedish comments to English

## Algorithm for ASCII Conversion

1. Load the image with sharp
2. Convert to grayscale
3. Scale down to desired width (maintain proportions, adjust for character aspect ratio)
4. Get pixel data as an array of brightness values (0-255)
5. Map each value to an ASCII character based on brightness
6. Build into a string with line breaks

### Character Set

From dark to light:

```
@%#*+=-:.
```

Darker characters (like @) are used for low values (dark pixels), lighter characters (like .) for high values (light pixels).

## Future Iterations

1. Web interface for upload and display
2. CLI tool
3. Serverless deployment (Cloudflare Workers)
4. More character sets
5. Support for URL input
6. Color ASCII with ANSI codes

## Code Language Policy

All code, comments, and test descriptions in this project are written in English. This was addressed in a dedicated translation effort after the initial development phase (which was done with Swedish comments due to the conversation language).

A `.claude/instructions.md` file has been added to ensure future Claude Code sessions maintain English code regardless of conversation language.
