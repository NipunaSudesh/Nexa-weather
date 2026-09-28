"use client";

import { useState } from "react";

export default function AddCity({ onCityAdded }) {
  const [query, setQuery] = useState("");
const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchCity = async () => {
  if (!query.trim()) return;

  setLoading(true);
  setMessage("");
  setCities([]);

  try {
    const response = await fetch(
      `/api/city-search?city=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "City not found");
      return;
    }

    if (Array.isArray(data) && data.length > 0) {
      setCities(data);
    } else {
      setMessage("City not found");
    }
  } catch (error) {
    console.error(error);
    setMessage("Failed to search city");
  } finally {
    setLoading(false);
  }
};
  const addCity = async (selectedCity) => {
  if (!selectedCity) return;

  try {
    const response = await fetch("/api/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedCity),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Failed to add city");
      return;
    }

    setMessage(
      `${selectedCity.CityName} added successfully`
    );

    setCities([]);

    if (onCityAdded) {
      await onCityAdded();
    }
  } catch (error) {
    console.error(error);
    setMessage("Failed to add city");
  }
};
  const cancelSearch = () => {
    setCity(null);
    setQuery("");
    setMessage("");
  };

  return (
    <div className="mx-auto mb-6 w-full max-w-3xl">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMessage("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchCity();
            }
          }}
          placeholder="Search for a city..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />

        <button
          type="button"
          onClick={searchCity}
          disabled={loading || !query.trim()}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`mt-3 text-sm ${
            message.includes("successfully")
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

  {cities.length > 0 && (
  <div className="mt-4 space-y-3">
    {cities.map((city, index) => (
      <div
        key={`${city.CityCode}-${city.Latitude}-${city.Longitude}-${index}`}
        className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {city.CityName}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {city.Country}
              {city.State ? ` · ${city.State}` : ""}
              {" · "}
              {city.Temp}°C
              {" · "}
              {city.Status}
            </p>
          </div>

          <button
            type="button"
            onClick={() => addCity(city)}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
          >
            Add City
          </button>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
}