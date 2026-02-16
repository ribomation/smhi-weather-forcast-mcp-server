# SMHI Weather Forecast MCP Server - Implementationsplan

## Projektöversikt
Bygga en MCP (Model Context Protocol) server med stdio-transport som tillhandahåller verktyg för att hämta väderprognoser och historiska väderobservationer från SMHI:s Open Data API.

## Teknisk stack
- **Runtime:** Node.js
- **Språk:** TypeScript
- **Transport:** stdio (Standard Input/Output)
- **API:** SMHI Open Data API

## NPM-paket som behövs

### Kärnbibliotek
```json
{
  "@modelcontextprotocol/sdk": "^latest",
  "zod": "^3.x"
}
```
- `@modelcontextprotocol/sdk` - Official MCP SDK för att bygga servrar
- `zod` - Schema validation för API-parametrar och responses

### Development dependencies
```json
{
  "typescript": "^5.x",
  "@types/node": "^latest",
  "tsx": "^latest",
  "tsup": "^latest"
}
```
- `typescript` - TypeScript compiler
- `@types/node` - Type definitions för Node.js
- `tsx` - TypeScript execution och watch mode för development
- `tsup` - Snabb TypeScript bundler (alternativ: esbuild, tsc)

## Projektstruktur

```
smhi-weather-forcast-mcp-server/
├── src/
│   ├── index.ts                 # Entry point för MCP-servern
│   ├── server.ts                # MCP server setup och konfiguration
│   ├── tools/
│   │   ├── index.ts             # Export alla tools
│   │   ├── forecast.ts          # Verktyg för väderprognoser
│   │   └── observations.ts      # Verktyg för historiska observationer
│   ├── services/
│   │   ├── smhi-api.ts          # SMHI API client
│   │   └── types.ts             # TypeScript types för SMHI data
│   └── utils/
│       ├── validators.ts        # Zod schemas för input validation
│       └── formatters.ts        # Formatera API-responses
├── dist/                        # Kompilerad output (genereras av build)
├── plans/
│   └── mcp-server-implementation-plan.md
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md

```

## MCP Server Komponenter

### 1. Tools (Verktyg som exponeras)

#### Tool 1: `get-weather-forecast`
**Syfte:** Hämta väderprognos för en specifik plats

**Input schema:**
```typescript
{
  longitude: number,  // -180 till 180
  latitude: number,   // -90 till 90
  parameters?: string[] // Valfria parametrar att filtrera på
}
```

**Output:** JSON med prognosdata ca 10 dagar framåt

#### Tool 2: `get-weather-observations`
**Syfte:** Hämta historiska väderobservationer från en station

**Input schema:**
```typescript
{
  stationId: number,
  parameterId: number,  // T.ex. 1 för temperatur
  period: 'latest-hour' | 'latest-day' | 'latest-months' | 'corrected-archive',
  format?: 'json' | 'csv'
}
```

**Output:** Historisk väderdata med tidsstämplar och kvalitetskoder

#### Tool 3: `list-weather-stations`
**Syfte:** Lista tillgängliga SMHI-stationer

**Input schema:**
```typescript
{
  parameterId?: number  // Filtrera stationer som har specifik parameter
}
```

**Output:** Lista med stationer och deras metadata

#### Tool 4: `list-parameters`
**Syfte:** Lista tillgängliga väderparametrar

**Input schema:**
```typescript
{}  // Inga parametrar
```

**Output:** Lista med parameter-ID och beskrivningar

## Implementationssteg

### Fas 1: Projektsetup
1. ✅ Skapa projektstruktur
2. Initiera package.json med dependencies
3. Konfigurera TypeScript (tsconfig.json)
4. Konfigurera build system (tsup/esbuild)
5. Skapa .gitignore

### Fas 2: SMHI API Service
1. Implementera SMHI API client (services/smhi-api.ts)
2. Definiera TypeScript types för SMHI responses
3. Implementera error handling för API-anrop
4. Testa API-anrop manuellt

### Fas 3: MCP Server Core
1. Sätt upp basic MCP server med stdio transport
2. Registrera server capabilities
3. Implementera server lifecycle (start, stop)

### Fas 4: Implementera Tools
1. Implementera get-weather-forecast tool
2. Implementera get-weather-observations tool
3. Implementera list-weather-stations tool
4. Implementera list-parameters tool
5. Lägg till Zod validation för alla inputs

### Fas 5: Testing & Dokumentation
1. Testa med MCP Inspector/Claude Desktop
2. Skriva README med användningsinstruktioner
3. Lägga till exempel på tool-användning
4. Dokumentera SMHI API-parametrar

## TypeScript Konfiguration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Build Configuration

### package.json scripts
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  }
}
```

## MCP Server Entry Point Pattern

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'smhi-weather-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {}
  }
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [...] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle tool calls
});

// Start server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

## SMHI API Endpoints att använda

### Prognoser
```
GET https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/{lon}/lat/{lat}/data.json
```

### Observationer
```
GET https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/{parameterId}/station/{stationId}/period/{period}/data.json
```

### Stationer
```
GET https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/{parameterId}.json
```

## Framtida förbättringar (V2)
- Caching av SMHI API-anrop
- Resources för att exponera väderdata som läsbara resurser
- Prompts för vanliga väderförfrågningar
- Stöd för SSE transport
- Rate limiting
- Mer avancerad error handling och retry-logik

## Observera
⚠️ SMHI håller på att modernisera sina API:er - de nuvarande kommer avvecklas under våren 2026. Planera för eventuell migration till nya API:er.

---

**Skapad:** 2026-02-16
**Status:** Draft
**Nästa steg:** Påbörja Fas 1 - Projektsetup
