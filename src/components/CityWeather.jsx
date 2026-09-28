"use client";

import { useState } from "react";
import TemperatureChart from "@/components/TemperatureChart";

export default function CityWeather ({ cities }) {
const [selectedCity, setSelectedCity] = useState("");
const [forecast, setForecast] = useState([]);
const [forecastLoading, setForecastLoading] = useState(false);

const fetchForecast = async (cityCode) => {
if (!cityCode) return;


try {
  setForecastLoading(true);

  const res = await fetch(
    `/api/forecast?cityCode=${encodeURIComponent(cityCode)}`
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

        temperature: Number(item.temperature.toFixed(1)),
      };
    });

  setForecast(formattedData);
} catch (error) {
  console.error("Forecast error:", error);
  setForecast([]);
} finally {
  setForecastLoading(false);
}


};

const handleCityChange = (e) => {
const cityCode = e.target.value;

setSelectedCity(cityCode);

if (cityCode) {
  fetchForecast(cityCode);
} else {
  setForecast([]);
}


};

const handleCancel = () => {
setSelectedCity("");
setForecast([]);
};

return (
<>
{/* Temperature Trend Header */} <div className="mb-8 rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

```
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
          onChange={handleCityChange}
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

        {/* Cancel */}
        {selectedCity && (
          <button
            type="button"
            onClick={handleCancel}
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
        <div className="flex justify-center py-10">
          <p className="text-slate-600 dark:text-slate-400">
            Loading temperature forecast...
          </p>
        </div>
      ) : forecast.length > 0 ? (
        <TemperatureChart data={forecast} />
      ) : (
        <div className="rounded-xl border border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            No forecast data available for this city.
          </p>
        </div>
      )}

    </div>
  )}
</>
);
}
