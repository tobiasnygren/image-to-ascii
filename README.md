# image-to-ascii

A web service that converts images to ASCII art.

> **Test Project**: This project was created as an experiment in collaboration between a developer and [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's CLI for Claude. The purpose is to explore how AI-assisted development works in practice.

## About the Project

**Idea:** Build a simple API that accepts an image and returns an ASCII representation of it.

**Tech Stack:**

- Node.js (>=20.17.0)
- Hono (lightweight web framework)
- Sharp (image processing)
- Vitest (testing)

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` and set your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Generate a secure key
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=$API_KEY" > .env
```

| Environment Variable | Description               | Required            |
| -------------------- | ------------------------- | ------------------- |
| `API_KEY`            | Key for authentication    | Yes                 |
| `PORT`               | Port for the server       | No (default: 3000)  |

> **Note:** The server refuses to start without `API_KEY`. This ensures the API never runs unprotected.

## Usage

Start the server:

```bash
npm start
```

The server reads `API_KEY` from the `.env` file (see Configuration above).

Convert an image:

```bash
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -F "image=@your-image.png" \
  "http://localhost:3000/convert?width=80"
```

> **Tip:** Use `source .env` to load environment variables in your shell before running curl.

Example output:

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@%#****#%@@@@@@@@@@@
@@@@@@@%*-..      ..:+%@@@@@@@
@@@@@%=. . ........ . .-#@@@@@
@@@@#. .....       .... .+@@@@
@@@%. ..              ... *@@@
@@@= .                  . :@@@
@@@# ..                .. +@@@
@@@@*. .....       ..... =@@@@
@@@@@%-. . ........  . :*@@@@@
@@@@@@@#=:.       . .-*@@@@@@@
@@@@@@@@@@%#*+++++*%@@@@@@@@@@
```

## Development

```bash
# Start in watch mode
npm run dev

# Run tests
npm test

# Run tests once
npm run test:run
```

## API

### GET /

Returns API information and limits. Does not require authentication.

**Response:**

```json
{
  "name": "image-to-ascii",
  "version": "0.1.0",
  "endpoints": {
    "convert": "POST /convert (requires X-API-Key header)"
  },
  "limits": {
    "maxFileSize": "10 MB",
    "widthRange": "20-200 characters"
  }
}
```

### POST /convert

Converts an uploaded image to ASCII. **Requires authentication.**

**Headers:**

- `X-API-Key` - Your API key (required if `API_KEY` is set)

**Request:**

- Content-Type: `multipart/form-data`
- Body: `image` - image file (max 10 MB)

**Query parameters:**

- `width` (optional) - number of characters wide, 20-200 (default: 80)

**Response (200):**

```json
{
  "ascii": "@@@@....####\n@@@@....####\n...",
  "width": 80
}
```

**Error responses:**

| Status | Description                                     |
| ------ | ----------------------------------------------- |
| 400    | No image, file too large, or invalid format     |
| 401    | Missing or invalid API key                      |
| 500    | Internal error during conversion                |

## Security

The API has the following protections:

| Protection         | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| **API key**        | All requests to `/convert` require a valid `X-API-Key` header   |
| **File size**      | Max 10 MB per upload                                             |
| **Width limits**   | Limited to 20-200 characters to prevent resource attacks         |
| **Error messages** | Generic errors to client (does not leak internal information)    |

### Production Recommendations

- Always use a strong, random API key
- Run behind a reverse proxy (nginx, Cloudflare)
- Consider rate limiting at the proxy level
- Use HTTPS

---

## Development Process

This section documents our process - how the project came to be and was developed with the help of Claude Code.

### Background

The project started with a simple idea over morning coffee: "What if you could convert images to ASCII characters via an API?"

The developer (backend programmer with experience in PHP, Node.js, and C#) wanted to:

- Explore image handling in Node.js (an area without previous experience)
- Build something concrete and working
- Understand the code being created (not too complex)
- Test how AI-assisted development works in practice

### Technical Decisions

**Why Hono instead of Express?**
Express felt too large for the project. With Hono, we keep the door open for:

- CLI tools
- Serverless deployment (Cloudflare Workers, AWS Lambda)
- Simpler codebase

**Why Sharp?**
Sharp is an established library for image processing in Node.js. It's fast and handles what we need:

- Read various image formats
- Convert to grayscale
- Retrieve pixel data

**Why API key for authentication?**
The simplest possible security that works. Suitable for:

- Test projects and internal tools
- Easy to understand and implement
- Can be easily upgraded later

### Process

This is how the development went:

1. **Idea discussion** - Discussed the project idea and set boundaries
2. **Technology selection** - Chose Hono, Sharp, and Vitest based on requirements
3. **Project plan** - Claude Code created [docs/PLAN.md](docs/PLAN.md) with structure and algorithm
4. **Setup** - Created project structure, package.json, git configuration
5. **Converter module** - Implemented core logic step by step with explanations
6. **Testing** - Created test images programmatically (gradient, circle) and wrote tests
7. **API endpoint** - Connected Hono with the converter module
8. **Security** - Added API key, file limits, and input validation
9. **Documentation** - Updated README and PLAN.md

### How the Collaboration Worked

- **Explanations along the way** - Claude explained each step in the algorithm so the code became understandable
- **Discussion before implementation** - We discussed alternatives (e.g., Express vs Hono) before decisions
- **Iterative development** - Built one function at a time, tested, committed
- **Security mindset** - The developer asked about security, Claude proposed measures
- **Documentation** - Everything was documented continuously

### Lessons Learned

See [docs/RETROSPECTIVE.md](docs/RETROSPECTIVE.md) for a complete review of:

- What worked well
- What could have been done better
- Tips for future projects with Claude Code

---

## Project Structure

```
image-to-ascii/
├── src/
│   ├── index.js          # API server with Hono
│   ├── converter.js      # Image → ASCII conversion
│   └── charsets.js       # ASCII character sets
├── test/
│   ├── converter.test.js # Unit tests
│   ├── create-test-image.js  # Generates test images
│   └── fixtures/         # Test images (generated)
├── docs/
│   ├── PLAN.md           # Project plan and decisions
│   └── RETROSPECTIVE.md  # Lessons from the project
├── .env.example          # Template for environment variables
├── package.json
└── README.md
```

---

## License

MIT
