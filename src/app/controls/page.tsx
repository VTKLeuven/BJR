'use client'
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Runner } from '@prisma/client';

interface RunnerWithLaps extends Runner {
    laps: { startTime: string, time: number }[];
}

export default function ControlsPage() {
    const [previousRunner, setPreviousRunner] = useState<RunnerWithLaps & { lapTime?: number } | null>(null);
    const [currentRunner, setCurrentRunner] = useState<RunnerWithLaps | null>(null);
    const [nextRunner, setNextRunner] = useState<RunnerWithLaps | null>(null);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);


    async function fetchData() {
        try {
            console.log('Fetching data...');

            const response = await fetch('/api/controls-data', {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.previousRunner) {
                data.previousRunner.lapTime = data.previousRunner.laps[0]?.time;
            }
            console.log(data)
            setPreviousRunner(data.previousRunner);
            setCurrentRunner(data.currentRunner || null);
            setNextRunner(data.nextRunner);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }

    useEffect(() => {
        fetchData();

        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (currentRunner && currentRunner.laps && currentRunner.laps.length > 0) {
            const mostRecentLap = currentRunner.laps[0];
            timerRef.current = setInterval(() => {
                setTimer(Date.now() - new Date(mostRecentLap.startTime).getTime());
            }, 10);
        }

        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentRunner]);

    const handleStartNextRunner = async () => {
        await fetch('/api/start-next-runner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        await fetchData();
        setTimer(0);
    };

    const handleUndo = async () => {
        await fetch('/api/undo-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        await fetchData();
        if (currentRunner && currentRunner.laps && currentRunner.laps.length > 0) {
            const mostRecentLap = currentRunner.laps[0];
            setTimer(Date.now() - new Date(mostRecentLap.startTime).getTime());
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const hundredths = Math.floor((time % 1000) / 10);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${hundredths < 10 ? '0' : ''}${hundredths}`;
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Controls</h1>
            <div className="mb-4">
                <h2 className="text-l font-semibold">Previous Runner</h2>
                {previousRunner ? (
                    <div>
                        <p>Name: {previousRunner.firstName} {previousRunner.lastName}</p>
                        <p>Lap Time: {previousRunner.lapTime}</p>
                    </div>
                ) : (
                    <p>No previous runner</p>
                )}
            </div>
            <div className="mb-4">
                <h2 className="text-l font-semibold">Current Runner</h2>
                {currentRunner ? (
                    <div>
                        <p>Name: {currentRunner.firstName} {currentRunner.lastName}</p>
                        <p>Timer: {formatTime(timer)}</p>
                    </div>
                ) : (
                    <p>No current runner</p>
                )}
            </div>
            <div className="mb-4">
                <h2 className="text-l font-semibold">Next Runner</h2>
                {nextRunner ? (
                    <div>
                        <p>Name: {nextRunner.firstName} {nextRunner.lastName}</p>
                    </div>
                ) : (
                    <p>No next runner</p>
                )}
            </div>
            <Button onClick={handleStartNextRunner} disabled={!nextRunner} className="bg-blue-500 text-white p-2 rounded">Start Next Runner</Button>
            <Button onClick={handleUndo} disabled={!previousRunner || !currentRunner} className="bg-blue-500 text-white p-2 rounded" >Undo</Button>
        </div>
    );
}