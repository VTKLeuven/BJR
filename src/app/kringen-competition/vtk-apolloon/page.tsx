'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RunnerTimer from '@/components/RunnerTimer'

interface Kring {
    id: string;
    name: string;
    logoUrl: string;
    averageTime: string;
}

interface Runner {
    id: string;
    name: string;
    kringId: string;
    kringName: string;
    imageUrl: string;
    time: string;
}

interface LeaderboardEntry {
    lapId: string;
    runnerId: string;
    runnerName: string;
    kringId: string;
    kringName: string;
    time: string;
}

interface CompetitionData {
    countdownTime: string;
    totalRuns: number;
    activeKrings: Kring[];
    activeRunners: {
        [kringId: string]: Runner[];
    };
    leaderboard: LeaderboardEntry[];
    previousRunners: Runner[];
}

const apiService = {
    fetchCompetitionData: async (): Promise<CompetitionData> => {
        try {
            const response = await axios.get('/api/kringen-comp?kringNames[]=VTK&kringNames[]=Apolloon');
            return response.data;
        } catch (error) {
            console.error('Error fetching competition data:', error);
            throw error;
        }
    }
};

const KringenCompetitie: React.FC = () => {
    const [data, setData] = useState<CompetitionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>('00:00');

    // Hardcoded countdown to 15:10
    useEffect(() => {
        const target = new Date();
        target.setDate(target.getDate() + 1);
        target.setHours(15, 10, 0, 0); // Today at 15:10

        const updateCountdown = () => {
            const now = new Date();
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
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, []);

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
        const intervalId = setInterval(fetchData, 3000);
        return () => clearInterval(intervalId);
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
        <div className="bg-gray-50 text-gray-900 h-screen w-screen" data-page-type="kringencompetitie">
            <div className="container mx-auto px-6 py-4 h-full flex flex-col max-w-screen-2xl">
                <div className="flex justify-center items-center mb-6">
                    <div className="flex flex-col items-end">
                        <div> </div>
                    </div>
                </div>

                {/* Move the header section outside the columns */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">Kringencompetitie</h1>
                    <div className="flex flex-col items-end">
                        <div id="countdown-timer" className="text-6xl font-bold text-blue-600">
                            {countdown}
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 space-x-6 overflow-hidden">
                    <div className="w-7/12 flex flex-col space-y-6">
                        {/* Remove the header from here */}

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-xl font-bold mb-3">Actieve Kringen</h2>
                            <div className="grid grid-cols-2 gap-6 justify-center">
                                {/* Sort krings by averageTime and then map */}
                                {[...data.activeKrings]
                                    .sort((a, b) => {
                                        const convertToSeconds = (timeStr: string) => {
                                            const [minutesPart, secondsPart] = timeStr.split(':');
                                            const [seconds, milliseconds] = secondsPart.split('.').map(Number);

                                            const minutes = Number(minutesPart);
                                            return minutes * 60 + seconds + (milliseconds ? milliseconds / 100 : 0);
                                        };
                                        const timeA = convertToSeconds(a.averageTime);
                                        const timeB = convertToSeconds(b.averageTime);
                                        return timeA - timeB;
                                    })
                                    .map((kring, index) => (
                                        <div
                                            key={kring.id}
                                            id={`active-kring-${index}`}
                                            className="bg-blue-50 rounded-lg p-4 flex flex-col relative" // Added relative for positioning
                                            style={{ minHeight: '300px' }}
                                        >
                                            {/* Blue number indicator */}
                                            <div className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">
                                                {index + 1}.
                                            </div>

                                            <div className="flex justify-center items-center mb-6">
                                                <img
                                                    src={kring.logoUrl || "https://via.placeholder.com/40"}
                                                    alt={`${kring.name} Logo`}
                                                    className="kring-logo w-40 h-50 mr-3"
                                                />
                                            </div>

                                            {/* Container that will stick to the bottom */}
                                            <div className="mt-auto w-full">
                                                <div className="flex items-center justify-center mb-2">
                                                    <h3 className="kring-name text-xl font-semibold">{kring.name}</h3>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="kring-time text-4xl font-bold text-blue-600">{kring.averageTime}</div>
                                                    <div className="text-sm text-gray-600">Gemiddelde tijd</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

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
                                                            className="w-10 h-11 mr-3"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold truncate">{runner.name}</h3>
                                                        </div>
                                                        <div
                                                            id={`runner-timer-${kringIndex * 10 + runnerIndex}`}
                                                            className="text-2xl font-bold text-blue-600 ml-2"
                                                        >
                                                               <RunnerTimer startTime={runner.time} />
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

                    <div className="w-5/12 flex flex-col space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-4 flex-1 overflow-hidden">
                            <h2 className="text-xl font-bold mb-3">Snelste Lopers</h2>
                            <div className="space-y-3" style={{ maxHeight: '40vh' }}>
                                {data.leaderboard.map((entry, index) => (
                                    <div key={entry.lapId} className={`flex items-center p-2 ${index === 0 ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}>
                                        <div className="text-xl font-bold w-8">{index + 1}</div>
                                        <img
                                            src={`/kringen/${entry.kringName.replace(/\s+/g, '')}.png`}
                                            alt={`${entry.kringName} Logo`}
                                            className="w-10 h-11 mx-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{entry.runnerName}</h3>
                                            <p className="text-sm text-gray-600 truncate">{entry.kringName}</p>
                                        </div>
                                        <div className="text-xl font-bold text-blue-600 ml-4">{entry.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
                            <h2 className="text-xl font-bold mb-3">Vorige Lopers</h2>
                            <div id="previous-runners-container" className="space-y-3">
                                {data.previousRunners.map((runner) => (
                                    <div key={runner.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                        <img
                                            src={runner.imageUrl || "https://via.placeholder.com/40"}
                                            alt={`${runner.kringName} Logo`}
                                            className="w-10 h-11 mr-3"
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

export default KringenCompetitie;