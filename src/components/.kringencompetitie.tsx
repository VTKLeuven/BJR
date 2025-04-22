import React, { useState, useEffect } from 'react';
import axios from 'axios';


interface Kring {
    id: string;
    name: string;
    logoUrl: string;
    averageTime: string; // Format: M:SS.ms
}

interface Runner {
    id: string;
    name: string;
    kringId: string;
    kringName: string;
    imageUrl: string;
    time: string; // Format: MM:SS.ms
}

interface CompetitionData {
    countdownTime: string; // Format: MM:SS.ms
    totalRuns: number;
    activeKrings: Kring[];
    activeRunners: {
        [kringId: string]: Runner[];
    };
    leaderboard: Kring[];
    previousRunners: Runner[];
}

// API service for data fetching #TODO Api logo
const apiService = {
    fetchCompetitionData: async (): Promise<CompetitionData> => {
        try {
            const response = await axios.get('/api/kringencompetitie');
            return response.data;
        } catch (error) {
            console.error('Error fetching competition data:', error);
            throw error;
        }
    }
};
 className={`flex items-center p-2 ${index === 0 ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}
                                >
const Kringencompetitie: React.FC = () => {
    const [data, setData] = useState<CompetitionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const competitionData = await apiService.fetchCompetitionData();
                setData(competitionData);
                setError(null);
            } catch (err) {
                setError('Failed to load competition data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Set up polling to refresh data every 3 seconds
        const intervalId = setInterval(fetchData, 3000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // Loading state #TODO als ge andere loading wilt
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
        <div className="bg-gray-50 text-gray-900 h-screen w-screen" data-page-type="kringencompetitie">
            <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
                <div className="flex justify-center items-center mb-6">
                    <div className="flex flex-col items-end">
                        <div> </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 space-x-6 overflow-hidden">
                    {/* Left column */}
                    <div className="w-7/12 flex flex-col space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-4xl font-bold">Kringencompetitie</h1>
                            <div className="flex flex-col items-end">
                                <div id="countdown-timer" className="text-6xl font-bold text-blue-600">
                                    {data.countdownTime}
                                </div>
                                <div className="text-xl mt-1">
                                    Totaal aantal runs: <span id="total'axuis-runs" className="font-bold">{data.totalRuns}</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Kringen */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-xl font-bold mb-3">Actieve Kringen</h2>
                            <div className="grid grid-cols-2 gap-6 justify-center">
                                {data.activeKrings.map((kring, index) => (
                                    <div
                                        key={kring.id}
                                        id={`active-kring-${index}`}
                                        className="bg-blue-50 rounded-lg p-4 justify-center"
                                    >
                                        <div className="flex justify-center items-center mb-6">
                                            <img
                                                src={kring.logoUrl || "https://via.placeholder.com/40"}
                                                alt={`${kring.name} Logo`}
                                                className="kring-logo w-10 h-10 rounded-full mr-3"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center mb-2">
                                            <h3 className="kring-name text-xl font-semibold">{kring.name}</h3>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="kring-time text-4xl font-bold text-blue-600">{kring.averageTime}</div>
                                            <div className="text-sm text-gray-600">Gemiddelde tijd</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Running now section */}
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Nu Aan Het Lopen</h2>
                            <div className="flex space-x-4">
                                {Object.entries(data.activeRunners).map(([kringId, runners], kringIndex) => {
                                    const kring = data.activeKrings.find(k => k.id === kringId);
                                    return (
                                        <div key={kringId} className="w-1/2">
                                            <div className="bg-blue-200 rounded-lg p-2 mb-2">
                                                <h3 className="font-semibold text-center">{kring?.name || `Kring ${kringIndex + 1}`}</h3>
                                            </div>
                                            <div className={`${kring?.name?.toLowerCase().replace(' ', '-')}-runners-container space-y-3`}>
                                                {runners.map((runner, runnerIndex) => (
                                                    <div key={runner.id} className="bg-blue-100 rounded-lg p-3 flex items-center">
                                                        <img
                                                            src={runner.imageUrl || "https://via.placeholder.com/40"}
                                                            alt={`${kring?.name} Logo`}
                                                            className="w-10 h-10 rounded-full mr-3"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold truncate">{runner.name}</h3>
                                                        </div>
                                                        <div
                                                            id={`runner-timer-${kringIndex * 10 + runnerIndex}`}
                                                            className="text-2xl font-bold text-blue-600 ml-2"
                                                        >
                                                            {runner.time}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="w-5/12 flex flex-col space-y-6">
                        {/* Leaderboard */}
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Leaderboard</h2>
                            <div id="leaderboard-container" className="space-y-3 overflow-hidden" style={{ maxHeight: '40vh' }}>
                                {data.leaderboard.map((kring, index) => (
                                    <div
                                        key={kring.id}
                                        className={`flex items-center p-2 ${index === 0 ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}
                                    >
                                        <div className="text-xl font-bold w-8">{index + 1}</div>
                                        <img
                                            src={kring.logoUrl || "https://via.placeholder.com/40"}
                                            alt={`${kring.name} Logo`}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <span className="flex-1 font-semibold truncate">{kring.name}</span>
                                        <span className="text-xl font-bold text-blue-600">{kring.averageTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Previous runners */}
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Vorige Lopers</h2>
                            <div id="previous-runners-container" className="space-y-3">
                                {data.previousRunners.map((runner) => (
                                    <div key={runner.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                        <img
                                            src={runner.imageUrl || "https://via.placeholder.com/40"}
                                            alt={`${runner.kringName} Logo`}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{runner.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{runner.kringName}</p>
                                        </div>
                                        <div className="text-xl font-bold text-blue-600">{runner.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Kringencompetitie;