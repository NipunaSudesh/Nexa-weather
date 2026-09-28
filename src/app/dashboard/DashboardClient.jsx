
"use client";

import Navbar from "@/components/Navbar";
import WeatherCard from "@/components/WeatherCard";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import TemperatureChart from "@/components/TemperatureChart";
import AddCity from "@/components/AddCity";
export default function Dashboard() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedCity, setSelectedCity] = useState("");
const [forecast, setForecast] = useState([]);
const [forecastLoading, setForecastLoading] = useState(false);
  const [sortBy, setSortBy] = useState("comfort");
  const [filter, setFilter] = useState("all");

const fetchWeatherData = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch("/api/weather", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await res.json();

    setCities(data);
  } catch (error) {
    console.error(error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const removeCity = async (cityCode) => {
  try {
    const response = await fetch(
      `/api/cities?cityCode=${encodeURIComponent(cityCode)}`,
      {
        method: "DELETE",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    // Refresh immediately after successful delete
    await fetchWeatherData();
  } catch (error) {
    console.error("Delete city error:", error);
    alert("Failed to remove city");
  }
};
const fetchForecast = async (cityCode) => {
  if (!cityCode) return;

  try {
    setForecastLoading(true);

    const res = await fetch(
      `/api/forecast?cityCode=${cityCode}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch forecast");
    }

    const data = await res.json();

    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const formattedData = data.forecast
      .filter((item) => {
        const forecastDate = new Date(item.time);

        return (
          forecastDate >= startOfToday &&
          forecastDate <= endOfToday
        );
      })
      .map((item) => {
        const date = new Date(item.time);

        return {
          time: date.toLocaleString("en-US", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),

          temperature: Number(
            item.temperature.toFixed(1)
          ),
        };
      });

    setForecast(formattedData);

  } catch (error) {
    console.error(error);
  } finally {
    setForecastLoading(false);
  }
};
  // Filter and sort cities
 const processedCities = [...cities]
  .filter((city) => {
    const score = Number(city.comfortScore);

    if (filter === "comfortable") {
      return score >= 70;
    }

    if (filter === "moderate") {
      return score >= 50 && score < 70;
    }

    if (filter === "uncomfortable") {
      return score < 50;
    }

    return true;
  })
  .sort((a, b) => {
    const comfortA = Number(a.comfortScore);
    const comfortB = Number(b.comfortScore);

    const temperatureA = Number(a.temperature);
    const temperatureB = Number(b.temperature);

    if (sortBy === "comfort-high") {
      return comfortB - comfortA;
    }

    if (sortBy === "comfort-low") {
      return comfortA - comfortB;
    }

    if (sortBy === "temperature-low") {
      return temperatureA - temperatureB;
    }

    if (sortBy === "temperature-high") {
      return temperatureB - temperatureA;
    }

    if (sortBy === "city") {
      return String(a.city).localeCompare(String(b.city));
    }

    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Weather Dashboard
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Compare weather conditions and Comfort Index scores
            across cities.
          </p>
        </div>

        <AddCity onCityAdded={fetchWeatherData} />
{/* Temperature Trend */}
<div className="mb-8 rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <h2 className="text-lg font-semibold">
        Temperature Trend
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Select a city to view its forecast
      </p>
    </div>

    <div className="flex flex-col gap-2 sm:flex-row">

      {/* City Select */}
      <select
        value={selectedCity}
        onChange={(e) => {
          const cityCode = e.target.value;

          setSelectedCity(cityCode);
          fetchForecast(cityCode);
        }}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        <option value="">
          Select a city
        </option>

        {cities.map((city) => (
          <option
            key={city.cityCode}
            value={city.cityCode}
          >
            {city.city}
          </option>
        ))}
      </select>

      {/* Cancel Button */}
      {selectedCity && (
        <button
          type="button"
          onClick={() => {
            setSelectedCity("");
            setForecast([]);
          }}
          className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
        >
          Cancel
        </button>
      )}

    </div>

  </div>

</div>

{/* Temperature Chart */}
{selectedCity && (
  <div className="mb-10">

    {forecastLoading ? (
      <p className="py-10 text-center">
        Loading temperature forecast...
      </p>
    ) : (
      <TemperatureChart data={forecast} />
    )}

  </div>
)}
        {/* Sort & Filter */}
        {!loading && !error && (
          <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">

            {/* Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="filter"
                className="font-medium"
              >
                Filter:
              </label>

              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">
                  All Cities
                </option>

                <option value="comfortable">
                  Comfortable (70+)
                </option>

                <option value="moderate">
                  Moderate (50-69)
                </option>

                <option value="uncomfortable">
                  Uncomfortable (&lt;50)
                </option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="sort"
                className="font-medium"
              >
                Sort by:
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="comfort-high">
                  Comfort Index: High to Low
                </option>

                <option value="comfort-low">
                  Comfort Index: Low to High
                </option>

                <option value="temperature-low">
                  Temperature: Low to High
                </option>

                <option value="temperature-high">
                  Temperature: High to Low
                </option>

                <option value="city">
                  City Name: A-Z
                </option>
              </select>
            </div>

          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {processedCities.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {cities.length}
            </span>{" "}
            cities
          </div>
        )}

        {/* Weather Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-lg">
              Loading weather data...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-100 p-5 text-red-700 dark:bg-red-950 dark:text-red-300">
            Error: {error}
          </div>
        ) : processedCities.length === 0 ? (
          <div className="rounded-xl border border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-lg font-medium">
              No cities match this filter.
            </p>

            <button
              onClick={() => setFilter("all")}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Show All Cities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processedCities.map((city) => (
              <WeatherCard
                key={city.cityCode}
                city={city}
                 onRemove={removeCity}
              />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

