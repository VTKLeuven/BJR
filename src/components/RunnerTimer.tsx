import React, { useState, useEffect } from 'react';

interface RunnerTimerProps {
    startTime: string; // ISO string, e.g. "2025-04-22T18:46:33.022Z"
}

const RunnerTimer: React.FC<RunnerTimerProps> = ({ startTime }) => {
    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        const startTimestamp = new Date(startTime).getTime();
        const update = () => setElapsedMs(Date.now() - startTimestamp);

        update(); // show 00:00:00 immediately
        const id = window.setInterval(update, 10);
        return () => window.clearInterval(id);
    }, [startTime]);

    // compute minutes, seconds, centiseconds
    const minutes       = Math.floor(elapsedMs / 60000);
    const seconds       = Math.floor((elapsedMs % 60000) / 1000);
    const centiseconds  = Math.floor((elapsedMs % 1000) / 10);

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    const cs = String(centiseconds).padStart(2, '0');

    return <>{`${mm}:${ss}:${cs}`}</>;
};

export default RunnerTimer;