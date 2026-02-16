/**
 * SMHI Weather Forecast MCP Server - Entry Point
 */

import { startServer } from './server.js';

// Start the MCP server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
