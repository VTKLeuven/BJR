'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Group {
    id: string;
    name: string;
    averageTime: string; // Format: M:SS.ms
    color: string;       // Added color property from API
    position?: number;   // Position in leaderboard
}

interface Runner {
    id: string;
    name: string;
    groupId: string;
    groupName: string;
    color: string;       // Added color property from API
    currentTime?: string; // For active runners
    time?: string;        // For previous runners
    bestTime?: string;    // For previous runners
}

interface CompetitionData {
    countdownTime: string;     // Format: MM:SS.ms
    leaderboard: Group[];      // Groups sorted by their times
    activeRunners: Runner[];   // Currently running
    previousRunners: Runner[]; // Already finished
}

// API service for data fetching
const apiService = {
    fetchCompetitionData: async (): Promise<CompetitionData> => {
        try {
            const response = await axios.get('/api/groepencompetitie');
            return response.data;
        } catch (error) {
            console.error('Error fetching competition data:', error);
            throw error;
        }
    }
};

const parseTimeString = (timeString: string): number => {
    if (!timeString || timeString === '0' || timeString === '0:00' || timeString === '0:00.00') {
        return 0;
    }

    const parts = timeString.split(':');
    if (parts.length === 2) {
        const [minutes, secondsWithMs] = parts;
        const secondsParts = secondsWithMs.split('.');
        const seconds = parseInt(secondsParts[0], 10);

        // Handle milliseconds based on the number of digits
        let milliseconds = 0;
        if (secondsParts.length > 1) {
            const msString = secondsParts[1];
            if (msString.length === 2) {
                milliseconds = parseInt(msString, 10) / 100; // Centiseconds (e.g., .45 = 0.45s)
            } else if (msString.length === 3) {
                milliseconds = parseInt(msString, 10) / 1000; // True milliseconds (e.g., .450 = 0.45s)
            } else {
                // Handle any other length
                milliseconds = parseInt(msString, 10) / Math.pow(10, msString.length);
            }
        }

        return (parseInt(minutes, 10) * 60) + seconds + milliseconds;
    }
    return 0;
};

// Color indicator component
const ColorIndicator = ({ color, rank }: { color: string; rank?: number }) => (
    <div className="relative w-6 h-6 rounded-md mr-3 flex-shrink-0">
        <div
            className="w-full h-full rounded-md"
            style={{ backgroundColor: color }}
        />
        {rank !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {rank}
            </div>
        )}
    </div>
);

const Groepencompetitie: React.FC = () => {
    const [data, setData] = useState<CompetitionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const competitionData = await apiService.fetchCompetitionData();
                setData(competitionData);
                setError(null);
            } catch (err) {
                setError('Failed to load competition data')
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 2000);

        return () => clearInterval(intervalId);
    }, []);

    const [countdown, setCountdown] = useState<string>('00:00');
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const target = new Date(now);
            target.setDate(target.getDate() + 1);
            target.setHours(16, 15, 0, 0); // Target 16:15 today

            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown('00:00');
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateCountdown();
        const countdownIntervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(countdownIntervalId);
    }, []);

    // Loading state
    if (loading && !data) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Error state
    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
    }

    if (!data) {
        return null;
    }

    // Sort the leaderboard: teams with time 0 at bottom, others by lowest time
    const sortedLeaderboard = [...data.leaderboard].sort((a, b) => {
        const timeA = parseTimeString(a.averageTime);
        const timeB = parseTimeString(b.averageTime);

        // If one time is 0 and the other isn't, the 0 time goes to the bottom
        if (timeA === 0 && timeB !== 0) return 1;
        if (timeB === 0 && timeA !== 0) return -1;

        // Otherwise sort by lowest time first
        return timeA - timeB;
    });

    return (
        <div className="bg-gray-50 text-gray-900 h-screen w-screen">
            <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
                {/* Header with countdown timer */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">Groepencompetitie</h1>
                    <div id="countdown-timer" className="text-6xl font-bold text-green-600">
                        {countdown}
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 space-x-6 overflow-hidden">
                    {/* Left column - Leaderboard */}
                    <div className="w-7/12 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
                        <div className="space-y-3 overflow-hidden" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                            {sortedLeaderboard.map((group, index) => (
                                <div
                                    key={`group-${group.id}-${index}`}
                                    className={`flex items-center p-3 ${
                                        index === 0 && parseTimeString(group.averageTime) > 0
                                            ? 'bg-green-50'
                                            : 'bg-gray-50'
                                    } rounded-lg`}
                                >
                                    <ColorIndicator color={group.color} rank={index + 1} />
                                    <span className="flex-1 text-xl font-semibold">{group.name}</span>
                                    <span className="text-2xl font-bold text-green-600">{group.averageTime}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="w-5/12 flex flex-col space-y-6">
                        {/* Running now section */}
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Nu Aan Het Lopen</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {data.activeRunners.map((runner, index) => (
                                    <div key={`active-${runner.id}-${index}`} className="bg-green-100 rounded-lg p-4 flex items-center">
                                        <ColorIndicator color={runner.color} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold truncate">{runner.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{runner.groupName}</p>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600 ml-2">{runner.currentTime}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Previous runners */}
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Vorige Lopers</h2>
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Naam</th>
                                    <th className="text-left py-2">Groep</th>
                                    <th className="text-right py-2">Tijd</th>
                                    <th className="text-right py-2">Beste Tijd</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {data.previousRunners.map((runner, index) => (
                                    <tr key={`prev-${runner.id}-${index}`}>
                                        <td className="py-2 flex items-center">
                                            <ColorIndicator color={runner.color} />
                                            <span className="truncate">{runner.name}</span>
                                        </td>
                                        <td className="py-2">{runner.groupName.replace('Groep ', '')}</td>
                                        <td className="py-2 text-right">{runner.time}</td>
                                        <td className="py-2 text-right font-bold text-green-600">{runner.bestTime}</td>
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