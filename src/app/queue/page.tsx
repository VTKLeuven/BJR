'use client'
import { useState, useEffect } from "react";
import { Queue, Runner } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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

    const handleDelete = async (queuePlace: number) => {
        try {
            const response = await fetch(`/api/queue?queuePlace=${queuePlace}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setQueue(queue.filter(entry => entry.queuePlace !== queuePlace));
            } else {
                console.error("Failed to delete runner from queue");
            }
        } catch (error) {
            console.error("Error deleting runner from queue:", error);
        }
    };

    return (
        <div className="p-4 mx-auto max-w-lg w-full">
            <h1 className="text-xl font-bold mb-4">Queue</h1>
            {queue.length > 0 ? (
                <ul>
                    {queue.map((entry, index) => (
                        <li key={entry.queuePlace} className="border p-2 mb-2 flex justify-between items-center">
                            <span>{index + 1}. {entry.runner.firstName} {entry.runner.lastName}</span>
                            <button onClick={() => handleDelete(entry.queuePlace)} className="text-red-500 ml-auto">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No entries in the queue.</p>
            )}
        </div>
    );
}