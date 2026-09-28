import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { calculateComfortIndex } from "@/lib/comfortIndex";
import {
  getCache,
  setCache,
  CACHE_TTL,
} from "@/lib/cache";

const filePath = path.join(
  process.cwd(),
  "src",
  "data",
  "cities.json"
);

export async function GET() {
  try {
    const processedCacheKey = "processed-weather-output";

    const processedCache = getCache(
      processedCacheKey
    );

    if (processedCache.hit) {
      return NextResponse.json(
        processedCache.data,
        {
          headers: {
            "X-Cache-Status": "HIT",
          },
        }
      );
    }

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const citiesData = JSON.parse(file);

    const cityCodes = citiesData.List
      .map((city) => ({
        id: String(city.CityCode).trim(),
        name: city.CityName,
        latitude: city.Latitude,
        longitude: city.Longitude,
      }))
      .slice(0, 15);

    const results = await Promise.all(
      cityCodes.map(async (city) => {
        const cacheKey = `raw-weather-${city.id}`;

        const cached = getCache(cacheKey);

        let data;

        if (cached.hit) {
          data = cached.data;
        } else {
          let url;

          if (
            city.latitude !== undefined &&
            city.longitude !== undefined
          ) {
            url =
              `https://api.openweathermap.org/data/2.5/weather` +
              `?lat=${city.latitude}` +
              `&lon=${city.longitude}` +
              `&appid=${process.env.OPENWEATHER_API_KEY}` +
              `&units=metric`;
          } else {

            url =
              `https://api.openweathermap.org/data/2.5/weather` +
              `?id=${city.id}` +
              `&appid=${process.env.OPENWEATHER_API_KEY}` +
              `&units=metric`;
          }

          const response = await fetch(url);

          if (!response.ok) {
            const errorData =
              await response
                .json()
                .catch(() => ({}));

            console.error(
              "OpenWeather error:",
              {
                city: city.name,
                cityCode: city.id,
                status: response.status,
                error: errorData,
              }
            );

            throw new Error(
              `OpenWeather API error for ${city.name} (${city.id}): ${response.status}`
            );
          }

          data = await response.json();

          // Cache raw weather
          setCache(
            cacheKey,
            data,
            CACHE_TTL.RAW_WEATHER
          );
        }

        const comfortScore =
          calculateComfortIndex({
            temperature: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            cloudiness: data.clouds.all,
            visibility: data.visibility,
          });

        return {
          cityCode: city.id,

          // Use saved city name for searched cities
          city: city.name,

          country: data.sys.country,

          temperature: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
          cloudiness: data.clouds.all,
          visibility: data.visibility,

          weather: data.weather[0].main,

          description:
            data.weather[0].description,

          icon: data.weather[0].icon,

          timezone: data.timezone,
          timestamp: data.dt,

          comfortScore,
        };
      })
    );

    results.sort(
      (a, b) =>
        b.comfortScore - a.comfortScore
    );

    const rankedResults = results.map(
      (city, index) => ({
        ...city,
        rank: index + 1,
      })
    );

    setCache(
      processedCacheKey,
      rankedResults,
      CACHE_TTL.PROCESSED_OUTPUT
    );

    return NextResponse.json(
      rankedResults,
      {
        headers: {
          "X-Cache-Status": "MISS",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/weather error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
      },
      {
        status: 500,
      }
    );
  }
}