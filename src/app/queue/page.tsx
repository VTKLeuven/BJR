'use client'
import { useState, useEffect } from "react";
import { Queue, Runner } from '@prisma/client';

interface QueueWithRunner extends Queue {
    runner: Runner;
}

export default function QueuePage() {
    const [queue, setQueue] = useState<QueueWithRunner[]>([]);

    useEffect(() => {
        async function fetchQueue() {
            const response = await fetch("/api/queue");
            const data = await response.json();
            if (Array.isArray(data)) {
                setQueue(data);
            } else {
                setQueue([]);
                console.error("API response is not an array or is empty:", data);
            }
        }

        fetchQueue();
    }, []);

    return (
        <div className="p-4 mx-auto max-w-lg w-full">
            <h1 className="text-xl font-bold mb-4">Queue</h1>
            {queue.length > 0 ? (
                <ul>
                    {queue.map((entry, index) => (
                        <li key={entry.queuePlace} className="border p-2 mb-2">
                            {index + 1}. {entry.runner.firstName} {entry.runner.lastName}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No entries in the queue.</p>
            )}
        </div>
    );
}