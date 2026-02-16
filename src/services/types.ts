/**
 * TypeScript types for SMHI Open Data API
 * Based on SMHI API documentation at opendata.smhi.se
 */

// Forecast API Types

export interface ForecastPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ForecastGeometry {
  type: 'Point';
  coordinates: [number, number, number]; // [longitude, latitude, elevation]
}

export interface ForecastParameter {
  name: string;
  levelType: string;
  level: number;
  unit: string;
  values: number[];
}

export interface ForecastTimeSeries {
  validTime: string; // ISO 8601 datetime
  parameters: ForecastParameter[];
}

export interface ForecastResponse {
  approvedTime: string; // ISO 8601 datetime
  referenceTime: string; // ISO 8601 datetime
  geometry: ForecastGeometry;
  timeSeries: ForecastTimeSeries[];
}

// Observations API Types

export interface ObservationStation {
  id: number;
  name: string;
  height: number;
  latitude: number;
  longitude: number;
  active: boolean;
  from?: number; // Unix timestamp (ms)
  to?: number; // Unix timestamp (ms)
  key?: string;
  updated?: number; // Unix timestamp (ms)
  title?: string;
  summary?: string;
  link?: Array<{ rel: string; type: string; href: string }>;
}

export interface ObservationParameter {
  key: string;
  name: string;
  summary: string;
  unit: string;
}

export interface ObservationValue {
  date: number; // Unix timestamp (ms)
  value: string;
  quality: string;
}

export interface ObservationData {
  date: number; // Unix timestamp (ms)
  value: number | string;
  quality: 'G' | 'Y' | 'R'; // Green, Yellow, Red
}

export interface ObservationResponse {
  station: ObservationStation;
  parameter: ObservationParameter;
  period: {
    key: string;
    from: number;
    to: number;
    summary: string;
    sampling: string;
  };
  data: ObservationData[];
}

export interface ParameterInfo {
  key: number;
  title: string;
  summary: string;
  valueType: string;
  stationSet?: {
    key: number;
    title: string;
    summary: string;
    link: Array<{ rel: string; type: string; href: string }>;
  };
  station?: ObservationStation[];
}

// API Error Types

export interface SMHIError {
  message: string;
  statusCode?: number;
  endpoint?: string;
}

// Available periods for observations
export type ObservationPeriod =
  | 'latest-hour'
  | 'latest-day'
  | 'latest-months'
  | 'corrected-archive';

// Available data formats
export type DataFormat = 'json' | 'csv' | 'xml';

// Common weather parameter IDs
export const WeatherParameters = {
  TEMPERATURE: 1,
  HUMIDITY: 6,
  WIND_SPEED: 4,
  WIND_DIRECTION: 3,
  PRECIPITATION: 5,
  PRESSURE: 9,
  VISIBILITY: 12,
  SNOW_DEPTH: 8,
} as const;
