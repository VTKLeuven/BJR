"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

/**
 * ------------------------------------------------------
 *  Types
 * ------------------------------------------------------
 */
interface GroupLeaderboardEntry {
  id: string;
  name: string;
  color: string;
  averageDisplay: string; // “M:SS.xx” formatted for UI
  avgSeconds: number; // numerical value for sorting
}

interface Runner {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  color: string;
  currentTime?: string; // Active runners
  time?: string; // Previous runners – last run
  bestTime?: string; // Best run (used for leaderboard)
}

interface CompetitionData {
  countdownTime: string;
  activeRunners: Runner[];
  previousRunners: Runner[];
}

/**
 * ------------------------------------------------------
 *  API helper
 * ------------------------------------------------------
 */
const apiService = {
  fetchCompetitionData: async (): Promise<CompetitionData> => {
    const { data } = await axios.get<CompetitionData>("/api/groepencompetitie");
    return data;
  },
};

/**
 * ------------------------------------------------------
 *  Time helpers
 * ------------------------------------------------------
 */
const EMPTY = Number.POSITIVE_INFINITY;

/** Convert “M:SS”, “M:SS.CS/MS” → seconds */
const toSeconds = (str?: string | null): number => {
  if (!str) return EMPTY;
  if (str === "0" || str === "0:00" || str === "0:00.00") return 0;
  const [m, s] = str.trim().split(":");
  if (!s) return EMPTY;
  const sec = parseFloat(s) + Number(m) * 60;
  return Number.isFinite(sec) ? sec : EMPTY;
};

/** Convert seconds → “M:SS.xx” (centiseconds) */
const toDisplay = (secs: number): string => {
  if (!Number.isFinite(secs) || secs === EMPTY) return "--";
  const m = Math.floor(secs / 60);
  const s = secs - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`; // always M:SS.xx
};

/**
 * ------------------------------------------------------
 *  UI bits
 * ------------------------------------------------------
 */
const ColorIndicator: React.FC<{ color: string; rank?: number }> = ({
  color,
  rank,
}) => (
  <div className="relative w-6 h-6 rounded-md mr-3 flex-shrink-0">
    <div className="w-full h-full rounded-md" style={{ backgroundColor: color }} />
    {rank !== undefined && (
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
        {rank}
      </div>
    )}
  </div>
);

/**
 * ------------------------------------------------------
 *  Main component
 * ------------------------------------------------------
 */
const Groepencompetitie: React.FC = () => {
  const [data, setData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");

  /** Countdown → 15:10 today local */
  useEffect(() => {
    const target = new Date();
    target.setHours(15, 10, 0, 0);
    if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);

    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setCountdown("00:00:00");
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setCountdown(`${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /** Poll */
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setData(await apiService.fetchCompetitionData());
        setError(null);
      } catch (e) {
        setError("Failed to load competition data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const id = setInterval(fetch, 2000);
    return () => clearInterval(id);
  }, []);

  /**
   * Build leaderboard from previousRunners → bestTime per user → average per group
   */
  const leaderboard = useMemo<GroupLeaderboardEntry[]>(() => {
    if (!data) return [];

    const sums = new Map<
      string,
      { name: string; color: string; total: number; count: number }
    >();

    data.previousRunners.forEach((r) => {
      const best = toSeconds(r.bestTime);
      if (!Number.isFinite(best) || best === EMPTY) return; // skip no time
      const entry = sums.get(r.groupId) ?? {
        name: r.groupName,
        color: r.color,
        total: 0,
        count: 0,
      };
      entry.total += best;
      entry.count += 1;
      sums.set(r.groupId, entry);
    });

    return Array.from(sums.entries()).map(([id, v]) => {
      const avg = v.total / v.count;
      return {
        id,
        name: v.name,
        color: v.color,
        avgSeconds: avg,
        averageDisplay: toDisplay(avg),
      };
    });
  }, [data]);

  /** Sort: lowest avg first; groups without times drop to bottom */
  const sorted = useMemo(() => {
    return [...leaderboard].sort((a, b) => a.avgSeconds - b.avgSeconds);
  }, [leaderboard]);

  /** Render branches */
  if (loading && !data)
    return <div className="flex justify-center items-center h-screen">Loading…</div>;
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  if (!data) return null;

  /** JSX */
  return (
    <div className="bg-gray-50 text-gray-900 h-screen w-screen">
      <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Groepencompetitie</h1>
          <div className="text-6xl font-bold text-green-600">{countdown}</div>
        </div>

        <div className="flex flex-1 space-x-6 overflow-hidden">
          {/* Leaderboard */}
          <div className="w-7/12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <div className="space-y-3 overflow-hidden" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {sorted.map((g, i) => (
                <div
                  key={g.id}
                  className={`flex items-center p-3 ${
                    i === 0 ? "bg-green-50" : "bg-gray-50"
                  } rounded-lg`}
                >
                  <ColorIndicator color={g.color} rank={i + 1} />
                  <span className="flex-1 text-xl font-semibold">{g.name}</span>
                  <span className="text-2xl font-bold text-green-600">
                    {g.averageDisplay}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="w-5/12 flex flex-col space-y-6">
            {/* Running now */}
            <div className="bg-white rounded-lg shadow-md p-4 flex-1">
              <h2 className="text-xl font-bold mb-3">Nu aan het lopen</h2>
              <div className="grid grid-cols-1 gap-4">
                {data.activeRunners.map((r) => (
                  <div key={r.id} className="bg-green-100 rounded-lg p-4 flex items-center">
                    <ColorIndicator color={r.color} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{r.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{r.groupName}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600 ml-2">{r.currentTime}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous runners */}
            <div className="bg-white rounded-lg shadow-md p-4 flex-1">
              <h2 className="text-xl font-bold mb-3">Vorige lopers</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Naam</th>
                    <th className="text-left py-2">Groep</th>
                    <th className="text-right py-2">Tijd</th>
                    <th className="text-right py-2">Beste tijd</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.previousRunners.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 flex items-center">
                        <ColorIndicator color={r.color} />
                        <span className="truncate">{r.name}</span>
                      </td>
                      <td className="py-2">{r.groupName.replace("Groep ", "")}</td>
                      <td className="py-2 text-right">{r.time}</td>
                      <td className="py-2 text-right font-bold text-green-600">{r.bestTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groepencompetitie;
