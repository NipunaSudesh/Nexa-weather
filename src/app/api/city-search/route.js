import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city || !city.trim()) {
      return NextResponse.json(
        { error: "Please enter a city name" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenWeather API key is missing" },
        { status: 500 }
      );
    }

    // Search city
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=5&appid=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    if (!geoResponse.ok) {
      return NextResponse.json(
        { error: "Failed to search city" },
        { status: 500 }
      );
    }

    const locations = await geoResponse.json();

    if (!locations.length) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }

    // Get weather for search results
    const results = await Promise.all(
      locations.map(async (location) => {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`,
          {
            cache: "no-store",
          }
        );

        if (!weatherResponse.ok) return null;

        const weather = await weatherResponse.json();

        return {
          CityCode: String(weather.id),
          CityName: weather.name,
          Country: weather.sys?.country || location.country,
          Temp: Number(weather.main?.temp || 0).toFixed(1),
          Status: weather.weather?.[0]?.main || "Unknown",
          Description: weather.weather?.[0]?.description || "",
          Latitude: location.lat,
          Longitude: location.lon,
        };
      })
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (error) {
    console.error("City search error:", error);

    return NextResponse.json(
      { error: "Unable to search city" },
      { status: 500 }
    );
  }
}