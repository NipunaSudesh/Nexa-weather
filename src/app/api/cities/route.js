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

const exists = data.List.some(
  (city) =>
    String(city.CityCode).trim() ===
      String(newCity.CityCode).trim() ||
    city.CityName.toLowerCase().trim() ===
      newCity.CityName.toLowerCase().trim()
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

data.List.push({
  CityCode: String(newCity.CityCode),
  CityName: newCity.CityName,
  Country: newCity.Country ?? "LK",
  Temp: String(newCity.Temp ?? "0"),
  Status: newCity.Status ?? "Unknown",
  Latitude: newCity.Latitude,
  Longitude: newCity.Longitude,
});

    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
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


    data.List = data.List.filter(
      (city) =>
        String(city.CityCode).trim() !==
        String(cityCode).trim()
    );


    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );


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