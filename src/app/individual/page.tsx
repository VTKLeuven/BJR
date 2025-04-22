'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Runner {
    id: string;
    name: string;
    kringId: string;
    kringName: string;
    imageUrl: string;
    time: string;       // Format: M:SS.ms
    bestTime?: string;  // Format: M:SS.ms
    currentTime?: string; // For active runners, format: MM:SS.ms
}

interface CompetitionData {
    currentTime: string;     // Live clock format: HH:MM:SS
    topRunners: Runner[];    // Top 10 best times
    activeRunners: Runner[]; // Currently running (max 4)
    previousRunners: Runner[]; // Already finished
}

const apiService = {
    fetchCompetitionData: async (): Promise<CompetitionData> => {
        try {
            const response = await axios.get('/api/BJR/individual-comp');
            return response.data;
        } catch (error) {
            console.error('Error fetching competition data:', error);
            throw error;
        }
    }

};

const IndividueleCompetitie: React.FC = () => {
    const [data, setData] = useState<CompetitionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [clock, setClock] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const competitionData = await apiService.fetchCompetitionData();
                setData(competitionData);
                setClock(competitionData.currentTime);
                setError(null);

            } catch (err) {
                setError('Failed to load competition data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const dataIntervalId = setInterval(fetchData, 3000);

        const clockIntervalId = setInterval(() => {
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];
            setClock(timeString);
        }, 1000);

        return () => {
            clearInterval(dataIntervalId);
            clearInterval(clockIntervalId);
        };
    }, []);

    if (loading && !data) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
    }

    if (!data) {
        return null;
    }

    return (
        <div className="bg-gray-50 text-gray-900 h-screen w-screen" data-page-type="individuele">
            <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
                {/* Header with clock */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">Individuele Competitie</h1>
                    <div id="live-clock" className="text-6xl font-bold text-red-600">
                        {clock}
                    </div>
                </div>

                {/* Main content area - Two column layout */}
                <div className="flex flex-1 space-x-6">
                    {/* Left column - Leaderboard only */}
                    <div className="w-1/2 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Top 10 Beste Tijden</h2>
                        <div className="space-y-3" id="leaderboard-container">
                            {data.topRunners.map((runner, index) => (
                                <div
                                    key={runner.id}
                                    className={`flex items-center p-2 ${index === 0 ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}
                                >
                                    <div className="text-xl font-bold w-8">{index + 1}</div>
                                    <img
                                        src={runner.imageUrl || "https://via.placeholder.com/40"}
                                        alt={`${runner.kringName} Logo`}
                                        className="w-10 h-10 mr-3"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">{runner.name}</h3>
                                        <p className="text-sm text-gray-600 truncate">{runner.kringName}</p>
                                    </div>
                                    <div className="text-xl font-bold text-red-600">{runner.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column - Two rows (Running now + Previous runners) */}
                    <div className="w-1/2 flex flex-col space-y-6">
                        {/* Top row - Running now with max 4 runners */}
                        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
                            <h2 className="text-2xl font-bold mb-4">Nu Aan Het Lopen</h2>
                            <div className="grid grid-cols-2 gap-4" id="running-now-container">
                                {data.activeRunners.map((runner, index) => (
                                    <div
                                        key={runner.id}
                                        className="bg-red-50 rounded-lg p-4 flex items-center"
                                    >
                                        <img
                                            src={runner.imageUrl || "https://via.placeholder.com/40"}
                                            alt={`${runner.kringName} Logo`}
                                            className="w-10 h-10 mr-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold truncate">{runner.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{runner.kringName}</p>
                                        </div>
                                        <div
                                            id={`runner-timer-${index}`}
                                            className="text-2xl font-bold text-red-600 ml-2"
                                        >
                                            {runner.currentTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom row - Previous runners */}
                        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
                            <h2 className="text-2xl font-bold mb-4">Vorige Lopers</h2>
                            <div id="previous-runners-container">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Naam</th>
                                        <th className="text-left py-2">Kring</th>
                                        <th className="text-right py-2">Tijd</th>
                                        <th className="text-right py-2">Beste Tijd</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                    {data.previousRunners.map((runner) => (
                                        <tr key={runner.id}>
                                            <td className="py-2 flex items-center">
                                                <img
                                                    src={runner.imageUrl || "https://via.placeholder.com/40"}
                                                    alt={`${runner.kringName} Logo`}
                                                    className="w-8 h-8 mr-2"/>
                                                <span className="truncate">{runner.name}</span>
                                            </td>
                                            <td className="py-2">{runner.kringName.replace('Kring ', '')}</td>
                                            <td className="py-2 text-right">{runner.time}</td>
                                            <td className="py-2 text-right font-bold text-red-600">{runner.bestTime || runner.time}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndividueleCompetitie;