# image-to-ascii

En webbtjänst som konverterar bilder till ASCII-konst.

> **Testprojekt**: Detta projekt skapas som ett experiment i samarbete mellan en utvecklare och [Claude Code](https://github.com/anthropics/claude-code) - Anthropics CLI för Claude. Syftet är att utforska hur AI-assisterad utveckling fungerar i praktiken.

## Om projektet

**Idé:** Bygga ett enkelt API som tar emot en bild och returnerar en ASCII-representation av den.

**Teknikstack:**
- Node.js
- Hono (lättviktigt webbramverk)
- Sharp (bildbehandling)
- Vitest (testning)

## Installation

```bash
npm install
```

## Användning

Starta servern:
```bash
npm start
```

Konvertera en bild:
```bash
curl -X POST -F "image=@din-bild.png" http://localhost:3000/convert
```

## Utveckling

```bash
# Starta i watch-mode
npm run dev

# Kör tester
npm test
```

## API

### POST /convert

Konverterar en uppladdad bild till ASCII.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` - bildfilen

**Query-parametrar:**
- `width` (valfri) - antal tecken bred, default 80

**Response:**
```json
{
  "ascii": "@@@@....####\n@@@@....####\n..."
}
```

---

## Utvecklingsprocess

Detta avsnitt dokumenterar vår process - hur projektet kom till och utvecklades.

### Bakgrund

Projektet startade med en enkel idé vid morgonkaffet: "Tänk om man kunde konvertera bilder till ASCII-tecken via ett API?"

### Initial diskussion

Utvecklaren (backend-programmerare med erfarenhet av PHP, Node.js och C#) ville:
- Utforska bildhantering i Node.js
- Bygga något konkret och fungerande
- Förstå koden som skapas (inte för komplext)

### Tekniska beslut

**Varför Hono istället för Express?**
Express kändes för stort för projektet. Med Hono håller vi dörren öppen för:
- CLI-verktyg
- Serverless-deployment (Cloudflare Workers, AWS Lambda)
- Enklare kodbas

**Varför Sharp?**
Sharp är ett etablerat bibliotek för bildbehandling i Node.js. Det är snabbt och hanterar det vi behöver:
- Läsa olika bildformat
- Konvertera till gråskala
- Hämta pixeldata

### Process

1. Diskuterade idén och omfattning
2. Valde teknikstack
3. Skapade projektplan (se [docs/PLAN.md](docs/PLAN.md))
4. Satte upp projektstruktur
5. Implementerar steg för steg

### Lärdomar

*Detta avsnitt fylls i under projektets gång.*

---

## Licens

MIT
