# SMHI Weather Forecast MCP Server

A Model Context Protocol (MCP) server that provides access to SMHI (Swedish Meteorological and Hydrological Institute) weather data, including forecasts and historical observations.

## Disclaimer 😳
This project is the result of an experiment of using *Claude Code AI* plus
*Wispr Flow*, where I mostly talk via Wispr to Claude, which then implements
an MCP server connecting to the Swedish weather data service (SMHI). You can
find my article (in Swedish) at this url 
https://www.ribomation.se/blog/2026/sa-har-kopplar-du-smhi-till-claude-ai/

The main objective is the journey, not the end result. That means, read the article, use Claude and follow along with the prompts and recreate your own weather service MCP.

## Features

- 🌤️ **Weather Forecasts** - Get 10-day weather forecasts for any location in Sweden
- 📊 **Historical Data** - Access weather observations from 996+ SMHI stations
- 🏢 **Station Listings** - Browse available weather stations by parameter
- 📋 **Parameter Catalog** - List all 40+ available weather parameters

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ribomation/smhi-weather-forecast-mcp-server.git
cd smhi-weather-forecast-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Usage

### With Claude Desktop

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "smhi-weather": {
      "command": "node",
      "args": [
        "/path/to/smhi-weather-forcast-mcp-server.js"
      ]
    }
  }
}
```

Then restart Claude Desktop.

### With Other MCP Clients

The server uses stdio transport and can be integrated with any MCP client that supports stdio.

## Available Tools

### 1. `get-weather-forecast`

Get weather forecast for a specific location.

**Parameters:**
- `longitude` (number, required): Longitude coordinate (-180 to 180)
- `latitude` (number, required): Latitude coordinate (-90 to 90)
- `category` (string, optional): Forecast category (default: "pmp3g")

**Example:**
```typescript
{
  "longitude": 18.0686,
  "latitude": 59.3293
}
```

**Returns:** Complete forecast data for ~10 days with hourly weather parameters.

### 2. `get-weather-observations`

Get historical weather observations from a SMHI station.

**Parameters:**
- `stationId` (number, required): SMHI station ID
- `parameterId` (number, required): Parameter ID (see common parameters below)
- `period` (string, optional): Time period - one of:
  - `"latest-hour"` (default)
  - `"latest-day"`
  - `"latest-months"`
  - `"corrected-archive"`

**Example:**
```typescript
{
  "stationId": 188790,
  "parameterId": 1,
  "period": "latest-hour"
}
```

**Returns:** Historical observation data with timestamps, values, and quality codes.

### 3. `list-weather-stations`

List available SMHI weather stations for a specific parameter.

**Parameters:**
- `parameterId` (number, required): Parameter ID to filter stations

**Example:**
```typescript
{
  "parameterId": 1
}
```

**Returns:** List of stations with ID, name, coordinates, elevation, and active status.

### 4. `list-weather-parameters`

List all available weather parameters.

**Parameters:** None

**Returns:** Complete list of queryable weather parameters with IDs and descriptions.

## Common Weather Parameters

| Parameter | ID | Description |
|-----------|----|----|
| Temperature | 1 | Air temperature (°C) |
| Wind Direction | 3 | Wind direction (degrees) |
| Wind Speed | 4 | Wind speed (m/s) |
| Precipitation | 5 | Precipitation (mm) |
| Humidity | 6 | Relative humidity (%) |
| Snow Depth | 8 | Snow depth (cm) |
| Pressure | 9 | Air pressure (hPa) |
| Visibility | 12 | Visibility (km) |

## Development

### Scripts

- `npm run build` - Build the project with tsup
- `npm run dev` - Run in development mode with watch
- `npm run type-check` - Type check without building
- `npm start` - Start the built server

### Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── services/
│   ├── smhi-api.ts       # SMHI API client
│   ├── types.ts          # TypeScript types
│   └── test-api.ts       # API test script
└── (tools/, utils/ - for future expansion)

dist/                     # Build output (generated)
```

## API Documentation

This server uses the SMHI Open Data API:
- **Forecast API**: https://opendata.smhi.se/apidocs/metfcst/
- **Observations API**: https://opendata.smhi.se/apidocs/metobs/
- **Main Portal**: https://opendata.smhi.se/

## Important Notes

⚠️ **API Changes**: SMHI is modernizing their APIs during spring 2026. The current APIs used by this server may be deprecated. Monitor [SMHI's updates page](https://www.smhi.se/data/om-smhis-data/uppdateringar-oppna-data/) for changes.

## Examples

### Get Stockholm Weather Forecast

Ask Claude:
> "What's the weather forecast for Stockholm?"

Claude will use `get-weather-forecast` with Stockholm's coordinates (18.0686, 59.3293).

### Find Temperature Stations

Ask Claude:
> "List all active temperature measurement stations in Sweden"

Claude will use `list-weather-stations` with `parameterId: 1` (temperature).

### Get Historical Data

Ask Claude:
> "Show me the temperature readings from Abisko station for the last hour"

Claude will:
1. Use `list-weather-stations` to find Abisko's station ID
2. Use `get-weather-observations` to fetch the temperature data

## License

MIT

---

Built with [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic.
