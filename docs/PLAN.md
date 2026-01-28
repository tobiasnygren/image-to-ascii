# Projektplan: image-to-ascii

## Bakgrund

Detta projekt skapades som ett testprojekt för att utforska samarbete mellan en utvecklare och Claude Code. Idén föddes vid morgonkaffet: bygga en enkel webbtjänst som konverterar bilder till ASCII-konst.

## Mål

Bygga ett lättviktigt API som:
1. Tar emot en uppladdad bild (valfritt format)
2. Konverterar bilden till gråskala
3. Genererar ASCII-representation av bilden
4. Returnerar ASCII-konsten som text

## Tekniska beslut

### Ramverk och bibliotek

| Paket | Version | Syfte |
|-------|---------|-------|
| hono | ^4.0.0 | Lättviktigt webbramverk |
| @hono/node-server | ^1.8.0 | Node.js-adapter för Hono |
| sharp | ^0.33.0 | Bildbehandling |
| vitest | ^1.0.0 | Testramverk |

### Varför dessa val?

- **Hono** istället för Express: Lättviktigt (3kb), fungerar i Node, Bun, Cloudflare Workers, AWS Lambda. Möjliggör framtida CLI-verktyg eller serverless-deployment utan omskrivning.
- **Sharp**: Snabb bildbehandling via libvips. Hanterar de flesta bildformat, gråskalekonvertering och pixelåtkomst.
- **Vitest**: Modernt, snabbt testramverk med bra DX.

## Projektstruktur

```
image-to-ascii/
├── src/
│   ├── index.js          # API-server med Hono, säkerhet
│   ├── converter.js      # Bild → ASCII-logik
│   └── charsets.js       # ASCII-teckenuppsättningar
├── test/
│   ├── converter.test.js    # Enhetstester (10 st)
│   ├── create-test-image.js # Genererar testbilder programmatiskt
│   └── fixtures/            # Testbilder (gradient, cirkel, etc.)
├── docs/
│   └── PLAN.md           # Denna fil
├── .env.example          # Mall för miljövariabler
├── package.json
├── .gitignore
└── README.md
```

## Git-workflow

Vi använder Git Flow:

```
main     ← Produktionsklar kod
  │
  └── dev     ← Integration/test
        │
        └── feature/*  ← Utveckling
```

- Utveckling sker i feature-branches
- Merge till `dev` för integration/test
- Merge till `main` när stabilt

## API-specifikation

### GET /

Health check - returnerar API-information. Öppen endpoint.

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

Konverterar en uppladdad bild till ASCII. **Kräver autentisering.**

**Headers:**
```
X-API-Key: din-api-nyckel
```

**Request:**
```
Content-Type: multipart/form-data

Body:
  - image: [bildfil, max 10 MB]

Query-parametrar (valfria):
  - width: antal tecken bred, 20-200 (default: 80)
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

## Säkerhet

### Principer

- **Ingen osäker default** - Servern vägrar starta utan `API_KEY` miljövariabel
- **Fail closed** - Vid saknad/felaktig nyckel returneras 401, inte öppen åtkomst

### Implementerade skydd

| Skydd | Beskrivning |
|-------|-------------|
| API-nyckel (obligatorisk) | `X-API-Key` header krävs, servern startar inte utan `API_KEY` |
| Filstorlek | Max 10 MB per uppladdning |
| Width-gränser | 20-200 tecken, värden utanför justeras automatiskt |
| Felmeddelanden | Generiska till klient, detaljerade i serverloggar |

### Ej implementerat (rekommenderas för produktion)

| Skydd | Rekommendation |
|-------|----------------|
| Rate limiting | Implementera på proxy-nivå (nginx, Cloudflare) |
| HTTPS | Kör bakom reverse proxy med TLS |
| Loggning | Lägg till strukturerad loggning för övervakning |

## Implementationssteg

- [x] Setup - Initiera projekt, installera beroenden
- [x] Converter-modul - Kärnan: bild-buffer → ASCII-sträng
- [x] API-endpoint - POST /convert
- [x] Tester - Enhetstester för converter (10 tester)
- [x] Säkerhet - API-nyckel, filgränser, inputvalidering
- [x] Dokumentation - README med instruktioner

## Algoritm för ASCII-konvertering

1. Ladda bilden med sharp
2. Konvertera till gråskala
3. Skala ner till önskad bredd (behåll proportioner, justera för teckenförhållande)
4. Hämta pixeldata som en array av ljusstyrka-värden (0-255)
5. Mappa varje värde till ett ASCII-tecken baserat på ljusstyrka
6. Bygg ihop till en sträng med radbrytningar

### Teckenuppsättning

Från mörkt till ljust:
```
@%#*+=-:.
```

Mörkare tecken (som @) används för låga värden (mörka pixlar), ljusare tecken (som .) för höga värden (ljusa pixlar).

## Framtida iterationer

1. Webbgränssnitt för uppladdning och visning
2. CLI-verktyg
3. Serverless deployment (Cloudflare Workers)
4. Fler teckenuppsättningar
5. Stöd för URL-input
6. Färg-ASCII med ANSI-koder
