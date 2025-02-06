'use client'
import { useState, useEffect } from 'react';

interface Runner {
    name: string;
    startTime: string | null;
    time?: number;
}

interface Lap {
    name: string;
    time: number;
}

interface QueueEntry {
    name: string;
}

interface Group {
    name: string;
    laps: number;
}

interface StatisticsData {
    currentRunner: Runner;
    last7Laps: Lap[];
    quickest7Runners: Lap[];
    currentQueue: QueueEntry[];
    groupLapRanking: Group[];
    top7Runners: Group[];
}

export default function Statistics() {
    const [data, setData] = useState<StatisticsData>({
        currentRunner: { name: '', startTime: null, time: 0 },
        last7Laps: [],
        quickest7Runners: [],
        currentQueue: [],
        groupLapRanking: [],
        top7Runners: []
    });

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/api/statistics');
            const result = await response.json();
            setData(result);
        }

        fetchData();

        const timer = setInterval(() => {
            setData(prev => ({
                ...prev,
                currentRunner: { ...prev.currentRunner, time: prev.currentRunner.startTime ? Date.now() - new Date(prev.currentRunner.startTime).getTime() : 0 }
            }));
        }, 10);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-grow grid grid-cols-3 gap-4">
                <div className="border p-4 flex flex-col items-center">
                    <h2>Current Runner</h2>
                    <p>Name: {data.currentRunner.name ? data.currentRunner.name : "none"}</p>
                    <p>Time: {(data.currentRunner.time! / 1000).toFixed(2)}s</p>
                </div>
                <div className="border p-4 flex flex-col items-center">
                    <h2>Last 7 Laps</h2>
                    <ul>
                        {data.last7Laps.map((lap, index) => (
                            <li key={index}>{lap.name}: {lap.time}s</li>
                        ))}
                    </ul>
                </div>
                <div className="border p-4 flex flex-col items-center">
                    <h2>Quickest 7 Runners</h2>
                    <ul>
                        {data.quickest7Runners.map((runner, index) => (
                            <li key={index}>{runner.name}: {runner.time}s</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-3 gap-4">
                <div className="border p-4 flex flex-col items-center">
                    <h2>Current Queue</h2>
                    <ol>
                        {data.currentQueue.slice(0, 7).map((runner, index) => (
                            <li key={index}>{index + 1}. {runner.name}</li>
                        ))}
                    </ol>
                </div>
                <div className="border p-4 flex flex-col items-center">
                    <h2>Group Lap Ranking</h2>
                    <ul>
                        {data.groupLapRanking.map((group, index) => (
                            <li key={index}>{group.name}: {group.laps} laps</li>
                        ))}
                    </ul>
                </div>
                <div className="border p-4 flex flex-col items-center">
                    <h2>Most Laps</h2>
                    <ul>
                        {data.top7Runners.map((runner, index) => (
                            <li key={index}>{runner.name} - {runner.laps}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}