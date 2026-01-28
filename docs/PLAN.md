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
│   ├── index.js          # Startar servern
│   ├── converter.js      # Bild → ASCII-logik
│   └── charsets.js       # ASCII-teckenuppsättningar
├── test/
│   ├── converter.test.js # Enhetstester
│   └── fixtures/         # Testbilder
├── docs/
│   └── PLAN.md           # Denna fil
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

### POST /convert

Konverterar en uppladdad bild till ASCII.

**Request:**
```
Content-Type: multipart/form-data

Body:
  - image: [bildfil]

Query-parametrar (valfria):
  - width: antal tecken bred (default: 80)
```

**Response (200):**
```json
{
  "ascii": "@@@@....####\n@@@@....####\n..."
}
```

**Response (400):**
```json
{
  "error": "No image provided"
}
```

## Implementationssteg

- [ ] Setup - Initiera projekt, installera beroenden
- [ ] Converter-modul - Kärnan: bild-buffer → ASCII-sträng
- [ ] API-endpoint - POST /convert
- [ ] Tester - Enhetstester för converter
- [ ] Dokumentation - README med instruktioner

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
