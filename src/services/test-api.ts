/**
 * Quick test script for SMHI API client
 * Run with: npm run dev src/services/test-api.ts
 */

import { smhiApi } from './smhi-api.js';

async function testAPI() {
  console.log('Testing SMHI API Client...\n');

  try {
    // Test 1: Get forecast for Stockholm (18.0686, 59.3293)
    console.log('1. Testing weather forecast for Stockholm...');
    const forecast = await smhiApi.getForecast(18.0686, 59.3293);
    console.log('✅ Forecast fetched successfully');
    console.log(`   Reference time: ${forecast.referenceTime}`);
    console.log(`   Number of time series: ${forecast.timeSeries.length}`);
    console.log(
      `   First forecast time: ${forecast.timeSeries[0]?.validTime}`
    );
    console.log();

    // Test 2: Get available parameters
    console.log('2. Testing get parameters...');
    const parameters = await smhiApi.getParameters();
    console.log('✅ Parameters fetched successfully');
    console.log(`   Total parameters: ${parameters.length}`);
    console.log(`   First few parameters:`);
    parameters.slice(0, 5).forEach((param) => {
      console.log(`   - ${param.key}: ${param.title}`);
    });
    console.log();

    // Test 3: Get stations for temperature (parameter 1)
    console.log('3. Testing get stations for temperature...');
    const stationsInfo = await smhiApi.getStations(1);
    console.log('✅ Stations fetched successfully');
    console.log(`   Parameter: ${stationsInfo.title}`);
    console.log(
      `   Total stations: ${stationsInfo.station?.length || 'unknown'}`
    );
    if (stationsInfo.station && stationsInfo.station.length > 0) {
      // Find an active station
      const activeStation = stationsInfo.station.find((s) => s.active) || stationsInfo.station[0];
      console.log(`   Using station: ${activeStation.name} (ID: ${activeStation.id})`);
      console.log(`   Station active: ${activeStation.active}`);
      console.log();

      // Test 4: Get observations from active station
      console.log('4. Testing get observations...');
      const stationId = activeStation.id;
      const observations = await smhiApi.getObservations(
        stationId,
        1,
        'latest-hour'
      );
      console.log('✅ Observations fetched successfully');
      console.log(`   Station: ${observations.station.name}`);
      console.log(`   Parameter: ${observations.parameter.name}`);
      if (observations.data && Array.isArray(observations.data)) {
        console.log(`   Data points: ${observations.data.length}`);
        if (observations.data.length > 0) {
          const latest = observations.data[observations.data.length - 1];
          const date = new Date(latest.date);
          console.log(`   Latest value: ${latest.value}°C at ${date.toISOString()}`);
        }
      } else {
        console.log(`   No data available for this station/period`);
      }
    }

    console.log('\n✅ All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

testAPI();
