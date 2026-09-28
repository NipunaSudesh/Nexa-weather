// import cities from "@/data/cities.json";

// export async function GET() {
//   const cityCodes = cities.List
//     .map((city) => city.CityCode)
//     .slice(0, 10);

//   return Response.json(cityCodes);
// }
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { clearAllCache } from "@/lib/cache";

const filePath = path.join(
  process.cwd(),
  "src",
  "data",
  "cities.json"
);

/**
 * GET
 * Return all saved cities
 */
export async function GET() {
  try {
    const file = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(file);

    return NextResponse.json(data.List);
  } catch (error) {
    console.error("GET /api/cities error:", error);

    return NextResponse.json(
      {
        error: "Failed to load cities",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 * Add a new city
 */
export async function POST(request) {
  try {
    const newCity = await request.json();

    if (!newCity.CityCode || !newCity.CityName) {
      return NextResponse.json(
        {
          error: "CityCode and CityName are required",
        },
        {
          status: 400,
        }
      );
    }

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const data = JSON.parse(file);

    /**
     * Check duplicate city
     */
    const exists = data.List.some(
      (city) =>
        String(city.CityCode).trim() ===
        String(newCity.CityCode).trim()
    );

    if (exists) {
      return NextResponse.json(
        {
          error: "City already added",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Add city
     */
    data.List.push({
      CityCode: String(newCity.CityCode),
      CityName: newCity.CityName,
      Temp: String(newCity.Temp ?? "0"),
      Status: newCity.Status ?? "Unknown",
    });

    /**
     * Save cities.json
     */
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    /**
     * VERY IMPORTANT
     * Weather data depends on the city list.
     * Remove old cached weather data.
     */
    clearAllCache();

    return NextResponse.json({
      message: "City added successfully",
      city: newCity,
    });
  } catch (error) {
    console.error("POST /api/cities error:", error);

    return NextResponse.json(
      {
        error: "Failed to add city",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE
 * Remove a city
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const cityCode = searchParams.get(
      "cityCode"
    );

    console.log(
      "DELETE cityCode:",
      cityCode
    );

    if (!cityCode) {
      return NextResponse.json(
        {
          error: "City code is required",
        },
        {
          status: 400,
        }
      );
    }

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const data = JSON.parse(file);


    /**
     * Check whether city exists
     */
    const cityExists = data.List.some(
      (city) =>
        String(city.CityCode).trim() ===
        String(cityCode).trim()
    );

    if (!cityExists) {
      console.log(
        "City not found:",
        cityCode
      );

      console.log(
        "Available city codes:",
        data.List.map((city) =>
          String(city.CityCode)
        )
      );

      return NextResponse.json(
        {
          error: `City not found. Code received: ${cityCode}`,
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Remove city
     */
    data.List = data.List.filter(
      (city) =>
        String(city.CityCode).trim() !==
        String(cityCode).trim()
    );

    /**
     * Save updated cities.json
     */
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    /**
     * Clear weather cache
     */
    clearAllCache();

    console.log(
      "City removed successfully:",
      cityCode
    );

    return NextResponse.json({
      message: "City removed successfully",
      cityCode,
    });
  } catch (error) {
    console.error(
      "DELETE /api/cities error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to remove city",
      },
      {
        status: 500,
      }
    );
  }
}