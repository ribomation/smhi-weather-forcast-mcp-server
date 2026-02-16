/**
 * SMHI Weather Forecast MCP Server
 * Provides tools for accessing SMHI weather data
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { smhiApi } from './services/smhi-api.js';
import { WeatherParameters } from './services/types.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'smhi-weather-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define available tools
  const tools: Tool[] = [
    {
      name: 'get-weather-forecast',
      description:
        'Get weather forecast for a specific location from SMHI. Returns forecast data for approximately 10 days ahead.',
      inputSchema: {
        type: 'object',
        properties: {
          longitude: {
            type: 'number',
            description: 'Longitude coordinate (-180 to 180)',
            minimum: -180,
            maximum: 180,
          },
          latitude: {
            type: 'number',
            description: 'Latitude coordinate (-90 to 90)',
            minimum: -90,
            maximum: 90,
          },
          category: {
            type: 'string',
            description:
              'Forecast category (default: pmp3g for point forecast)',
            default: 'pmp3g',
          },
        },
        required: ['longitude', 'latitude'],
      },
    },
    {
      name: 'get-weather-observations',
      description:
        'Get historical weather observations from a SMHI weather station.',
      inputSchema: {
        type: 'object',
        properties: {
          stationId: {
            type: 'number',
            description: 'SMHI station ID',
          },
          parameterId: {
            type: 'number',
            description:
              'Parameter ID (1=temperature, 3=wind direction, 4=wind speed, 5=precipitation, 6=humidity, 8=snow depth, 9=pressure, 12=visibility)',
          },
          period: {
            type: 'string',
            enum: [
              'latest-hour',
              'latest-day',
              'latest-months',
              'corrected-archive',
            ],
            description: 'Time period to fetch observations for',
            default: 'latest-hour',
          },
        },
        required: ['stationId', 'parameterId'],
      },
    },
    {
      name: 'list-weather-stations',
      description:
        'List available SMHI weather stations for a specific parameter.',
      inputSchema: {
        type: 'object',
        properties: {
          parameterId: {
            type: 'number',
            description:
              'Parameter ID to filter stations by (e.g., 1 for temperature)',
          },
        },
        required: ['parameterId'],
      },
    },
    {
      name: 'list-weather-parameters',
      description:
        'List all available weather parameters that can be queried from SMHI.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];

  // Handler for listing available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handler for tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'get-weather-forecast': {
          const { longitude, latitude, category = 'pmp3g' } = args as {
            longitude: number;
            latitude: number;
            category?: string;
          };

          const forecast = await smhiApi.getForecast(
            longitude,
            latitude,
            category
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(forecast, null, 2),
              },
            ],
          };
        }

        case 'get-weather-observations': {
          const { stationId, parameterId, period = 'latest-hour' } = args as {
            stationId: number;
            parameterId: number;
            period?: 'latest-hour' | 'latest-day' | 'latest-months' | 'corrected-archive';
          };

          const observations = await smhiApi.getObservations(
            stationId,
            parameterId,
            period
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(observations, null, 2),
              },
            ],
          };
        }

        case 'list-weather-stations': {
          const { parameterId } = args as { parameterId: number };

          const stationsInfo = await smhiApi.getStations(parameterId);

          // Return a simplified list of stations
          const stations = stationsInfo.station?.map((s) => ({
            id: s.id,
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            height: s.height,
            active: s.active,
          }));

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    parameter: stationsInfo.title,
                    totalStations: stations?.length || 0,
                    stations: stations || [],
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'list-weather-parameters': {
          const parameters = await smhiApi.getParameters();

          // Return a simplified list
          const paramList = parameters.map((p) => ({
            id: p.key,
            name: p.title,
            description: p.summary,
          }));

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    totalParameters: paramList.length,
                    commonParameters: {
                      temperature: WeatherParameters.TEMPERATURE,
                      humidity: WeatherParameters.HUMIDITY,
                      windSpeed: WeatherParameters.WIND_SPEED,
                      windDirection: WeatherParameters.WIND_DIRECTION,
                      precipitation: WeatherParameters.PRECIPITATION,
                      pressure: WeatherParameters.PRESSURE,
                      visibility: WeatherParameters.VISIBILITY,
                      snowDepth: WeatherParameters.SNOW_DEPTH,
                    },
                    parameters: paramList,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr so it doesn't interfere with stdio communication
  console.error('SMHI Weather Forecast MCP Server started');
  console.error('Server capabilities: tools');
}
