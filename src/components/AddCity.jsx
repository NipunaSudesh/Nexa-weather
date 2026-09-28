"use client";

import { useState } from "react";

export default function AddCity({ onCityAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchCity = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");
    setResults([]);

    try {
      const response = await fetch(
        `/api/city-search?city=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "City not found");
        return;
      }

      setResults(data);
    } catch (error) {
      setMessage("Failed to search city");
    } finally {
      setLoading(false);
    }
  };

  const addCity = async (city) => {
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

      // Remove from search results
      setResults((prev) =>
        prev.filter((item) => item.CityCode !== city.CityCode)
      );

      // Refresh dashboard
      if (onCityAdded) {
        onCityAdded();
      }
    } catch (error) {
      setMessage("Failed to add city");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchCity();
            }
          }}
          placeholder="Search for a city..."
          className="flex-1 rounded-lg border px-4 py-3"
        />

        <button
          onClick={searchCity}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-red-500">
          {message}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((city) => (
            <div
              key={city.CityCode}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <h3 className="font-semibold">
                  {city.CityName}
                </h3>

                <p className="text-sm text-gray-500">
                  {city.Country} · {city.Temp}°C · {city.Status}
                </p>
              </div>

              <button
                onClick={() => addCity(city)}
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Add City
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}