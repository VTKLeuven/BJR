import React, { useState, useEffect } from 'react';
import axios from 'axios';


interface Group {
    id: string;
    name: string;
    averageTime: string; // Format: M:SS.ms
    position?: number;   // Position in leaderboard
}

interface Runner {
    id: string;
    name: string;
    groupId: string;
    groupName: string;
    imageUrl: string;
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

const GroepenCompetitie: React.FC = () => {
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

    return (
        <div className="bg-gray-50 text-gray-900 h-screen w-screen">
            <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
                {/* Header with countdown timer */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">Groepencompetitie</h1>
                    <div id="countdown-timer" className="text-6xl font-bold text-green-600">
                        {data.countdownTime}
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 space-x-6 overflow-hidden">
                    {/* Left column - Leaderboard */}
                    <div className="w-7/12 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
                        <div className="space-y-3 overflow-hidden" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                            {data.leaderboard.map((group, index) => (
                                <div
                                    key={group.id}
                                    className={`flex items-center p-3 ${index === 0 ? 'bg-green-50' : 'bg-gray-50'} rounded-lg`}
                                >
                                    <div className="text-xl font-bold w-8">{index + 1}</div>
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
                            <div className="grid grid-cols-1 gap-4
">
                                {data.activeRunners.map(runner => (
                                    <div key={runner.id} className="bg-green-100 rounded-lg p-4 flex items-center">
                                        <img
                                            src={runner.imageUrl || "https://via.placeholder.com/40"}
                                            alt="Runner"
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
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
                                {data.previousRunners.map(runner => (
                                    <tr key={runner.id}>
                                        <td className="py-2 flex items-center">
                                            <img
                                                src={runner.imageUrl || "https://via.placeholder.com/40"}
                                                alt="Runner"
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
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

export default GroepenCompetitie;