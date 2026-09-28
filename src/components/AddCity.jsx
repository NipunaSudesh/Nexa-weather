"use client";

import { useState } from "react";

export default function AddCity({ onCityAdded }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchCity = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");
    setCity(null);

    try {
      const response = await fetch(
        `/api/city-search?city=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "City not found");
        return;
      }

      // Show only the first / most relevant result
      if (Array.isArray(data) && data.length > 0) {
        setCity(data[0]);
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

  const addCity = async () => {
    if (!city) return;

    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(city),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to add city");
        return;
      }

      setMessage(`${city.CityName} added successfully`);

      // Clear search result
      setCity(null);
      setQuery("");

      // Refresh dashboard
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

      {/* Single Search Result */}
      {city && (
        <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {city.CityName}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {city.Country} · {city.Temp}°C · {city.Status}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addCity}
                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
              >
                Add City
              </button>

              <button
                type="button"
                onClick={cancelSearch}
                className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}