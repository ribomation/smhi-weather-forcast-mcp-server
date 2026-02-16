/**
 * SMHI Open Data API Client
 * Documentation: https://opendata.smhi.se/apidocs/
 */

import {
  ForecastResponse,
  ObservationResponse,
  ParameterInfo,
  SMHIError,
  ObservationPeriod,
  DataFormat,
} from './types.js';

const FORECAST_BASE_URL =
  'https://opendata-download-metfcst.smhi.se/api/category';
const OBSERVATIONS_BASE_URL =
  'https://opendata-download-metobs.smhi.se/api';

/**
 * SMHI API Client for weather forecasts and observations
 */
export class SMHIApiClient {
  /**
   * Fetch weather forecast for a specific location
   * @param longitude Longitude coordinate (-180 to 180)
   * @param latitude Latitude coordinate (-90 to 90)
   * @param category Forecast category (default: pmp3g - point forecast)
   * @param version API version (default: 2)
   * @returns Weather forecast data
   */
  async getForecast(
    longitude: number,
    latitude: number,
    category: string = 'pmp3g',
    version: number = 2
  ): Promise<ForecastResponse> {
    const url = `${FORECAST_BASE_URL}/${category}/version/${version}/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw this.createError(
          `Failed to fetch forecast: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();
      return data as ForecastResponse;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw this.createError(
        `Network error while fetching forecast: ${(error as Error).message}`,
        undefined,
        url
      );
    }
  }

  /**
   * Fetch weather observations from a station
   * @param stationId Station ID
   * @param parameterId Parameter ID (e.g., 1 for temperature)
   * @param period Time period to fetch
   * @param format Data format (default: json)
   * @returns Observation data
   */
  async getObservations(
    stationId: number,
    parameterId: number,
    period: ObservationPeriod = 'latest-months',
    format: DataFormat = 'json'
  ): Promise<ObservationResponse> {
    const url = `${OBSERVATIONS_BASE_URL}/version/1.0/parameter/${parameterId}/station/${stationId}/period/${period}/data.${format}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw this.createError(
          `Failed to fetch observations: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();
      return data as ObservationResponse;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw this.createError(
        `Network error while fetching observations: ${(error as Error).message}`,
        undefined,
        url
      );
    }
  }

  /**
   * Get information about available stations for a parameter
   * @param parameterId Parameter ID
   * @returns Parameter info including available stations
   */
  async getStations(parameterId: number): Promise<ParameterInfo> {
    const url = `${OBSERVATIONS_BASE_URL}/version/1.0/parameter/${parameterId}.json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw this.createError(
          `Failed to fetch stations: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();
      return data as ParameterInfo;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw this.createError(
        `Network error while fetching stations: ${(error as Error).message}`,
        undefined,
        url
      );
    }
  }

  /**
   * Get all available parameters
   * @returns List of available parameters
   */
  async getParameters(): Promise<ParameterInfo[]> {
    const url = `${OBSERVATIONS_BASE_URL}/version/1.0/parameter.json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw this.createError(
          `Failed to fetch parameters: ${response.statusText}`,
          response.status,
          url
        );
      }

      const data = await response.json();

      // The API returns an object with a 'resource' array
      if (data && Array.isArray(data.resource)) {
        return data.resource as ParameterInfo[];
      }

      return data as ParameterInfo[];
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw this.createError(
        `Network error while fetching parameters: ${(error as Error).message}`,
        undefined,
        url
      );
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(
    message: string,
    statusCode?: number,
    endpoint?: string
  ): SMHIError {
    const error = new Error(message) as SMHIError;
    error.message = message;
    error.statusCode = statusCode;
    error.endpoint = endpoint;
    return error;
  }
}

// Export a singleton instance
export const smhiApi = new SMHIApiClient();
