# image-to-ascii

En webbtjänst som konverterar bilder till ASCII-konst.

> **Testprojekt**: Detta projekt skapades som ett experiment i samarbete mellan en utvecklare och [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - Anthropics CLI för Claude. Syftet är att utforska hur AI-assisterad utveckling fungerar i praktiken.

## Om projektet

**Idé:** Bygga ett enkelt API som tar emot en bild och returnerar en ASCII-representation av den.

**Teknikstack:**

- Node.js (>=20.17.0)
- Hono (lättviktigt webbramverk)
- Sharp (bildbehandling)
- Vitest (testning)

## Installation

```bash
npm install
```

## Konfiguration

Kopiera `.env.example` och sätt din API-nyckel:

```bash
cp .env.example .env
```

Redigera `.env`:

```bash
# Generera en säker nyckel
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=$API_KEY" > .env
```

| Miljövariabel | Beskrivning              | Obligatorisk        |
| ------------- | ------------------------ | ------------------- |
| `API_KEY`     | Nyckel för autentisering | Ja                  |
| `PORT`        | Port för servern         | Nej (default: 3000) |

> **Obs:** Servern vägrar starta utan `API_KEY`. Detta säkerställer att API:et aldrig körs oskyddat.

## Användning

Starta servern:

```bash
npm start
```

Servern läser `API_KEY` från `.env`-filen (se Konfiguration ovan).

Konvertera en bild:

```bash
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -F "image=@din-bild.png" \
  "http://localhost:3000/convert?width=80"
```

> **Tips:** Använd `source .env` för att ladda miljövariabler i din shell innan du kör curl.

Exempel på output:

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

## Utveckling

```bash
# Starta i watch-mode
npm run dev

# Kör tester
npm test

# Kör tester en gång
npm run test:run
```

## API

### GET /

Returnerar API-information och gränser. Kräver ingen autentisering.

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

Konverterar en uppladdad bild till ASCII. **Kräver autentisering.**

**Headers:**

- `X-API-Key` - Din API-nyckel (obligatorisk om `API_KEY` är satt)

**Request:**

- Content-Type: `multipart/form-data`
- Body: `image` - bildfilen (max 10 MB)

**Query-parametrar:**

- `width` (valfri) - antal tecken bred, 20-200 (default: 80)

**Response (200):**

```json
{
  "ascii": "@@@@....####\n@@@@....####\n...",
  "width": 80
}
```

**Felresponser:**

| Status | Beskrivning                                     |
| ------ | ----------------------------------------------- |
| 400    | Ingen bild, för stor fil, eller ogiltigt format |
| 401    | Saknad eller ogiltig API-nyckel                 |
| 500    | Internt fel vid konvertering                    |

## Säkerhet

API:et har följande skydd:

| Skydd              | Beskrivning                                                    |
| ------------------ | -------------------------------------------------------------- |
| **API-nyckel**     | Alla requests till `/convert` kräver giltig `X-API-Key` header |
| **Filstorlek**     | Max 10 MB per uppladdning                                      |
| **Width-gränser**  | Begränsat till 20-200 tecken för att förhindra resursattacker  |
| **Felmeddelanden** | Generiska fel till klient (läcker inte intern information)     |

### Rekommendationer för produktion

- Använd alltid en stark, slumpmässig API-nyckel
- Kör bakom en reverse proxy (nginx, Cloudflare)
- Överväg rate limiting på proxy-nivå
- Använd HTTPS

---

## Utvecklingsprocess

Detta avsnitt dokumenterar vår process - hur projektet kom till och utvecklades med hjälp av Claude Code.

### Bakgrund

Projektet startade med en enkel idé vid morgonkaffet: "Tänk om man kunde konvertera bilder till ASCII-tecken via ett API?"

Utvecklaren (backend-programmerare med erfarenhet av PHP, Node.js och C#) ville:

- Utforska bildhantering i Node.js (ett område utan tidigare erfarenhet)
- Bygga något konkret och fungerande
- Förstå koden som skapas (inte för komplext)
- Testa hur AI-assisterad utveckling fungerar i praktiken

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

**Varför API-nyckel för autentisering?**
Enklast möjliga säkerhet som fungerar. Passar för:

- Testprojekt och interna verktyg
- Lätt att förstå och implementera
- Kan enkelt uppgraderas senare

### Process

Så här gick utvecklingen till:

1. **Idédiskussion** - Diskuterade projektidén och satte ramar
2. **Teknikval** - Valde Hono, Sharp och Vitest baserat på krav
3. **Projektplan** - Claude Code skapade [docs/PLAN.md](docs/PLAN.md) med struktur och algoritm
4. **Setup** - Skapade projektstruktur, package.json, git-konfiguration
5. **Converter-modul** - Implementerade kärnlogiken steg för steg med förklaringar
6. **Testning** - Skapade testbilder programmatiskt (gradient, cirkel) och skrev tester
7. **API-endpoint** - Kopplade ihop Hono med converter-modulen
8. **Säkerhet** - Lade till API-nyckel, filgränser och inputvalidering
9. **Dokumentation** - Uppdaterade README och PLAN.md

### Hur samarbetet fungerade

- **Förklaringar längs vägen** - Claude förklarade varje steg i algoritmen så att koden blev begriplig
- **Diskussion före implementation** - Vi diskuterade alternativ (t.ex. Express vs Hono) innan beslut
- **Iterativ utveckling** - Byggde en funktion i taget, testade, committade
- **Säkerhetstänk** - Utvecklaren frågade om säkerhet, Claude föreslog åtgärder
- **Dokumentation** - Allt dokumenterades löpande

### Lärdomar

Se [docs/RETROSPECTIVE.md](docs/RETROSPECTIVE.md) för en fullständig genomgång av:

- Vad som fungerade bra
- Vad som kunde gjorts bättre
- Tips för framtida projekt med Claude Code

---

## Projektstruktur

```
image-to-ascii/
├── src/
│   ├── index.js          # API-server med Hono
│   ├── converter.js      # Bild → ASCII-konvertering
│   └── charsets.js       # ASCII-teckenuppsättningar
├── test/
│   ├── converter.test.js # Enhetstester
│   ├── create-test-image.js  # Genererar testbilder
│   └── fixtures/         # Testbilder (genererade)
├── docs/
│   ├── PLAN.md           # Projektplan och beslut
│   └── RETROSPECTIVE.md  # Lärdomar från projektet
├── .env.example          # Mall för miljövariabler
├── package.json
└── README.md
```

---

## Licens

MIT
