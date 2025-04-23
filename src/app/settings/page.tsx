'use client';
import { useState, useEffect } from 'react';

export default function ControlsPage() {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // On mount, fetch the current competition state
    useEffect(() => {
        async function fetchState() {
            try {
                const res = await fetch('/api/update-competition');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json() as { competition: number };
                setActiveIndex(data.competition);
            } catch (err) {
                console.error('Failed to load competition state:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchState();
    }, []);

    const handleToggleClick = async (index: number) => {
        const newIndex = activeIndex === index ? 0 : index;
        setActiveIndex(newIndex);

        await fetch('/api/update-competition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competition: newIndex }),
        });
    };

    const toggles = [
        'Industria-Medica',
        'LBK-VRG',
        'VTK-Apolloon',
        'Group competition',
        'Individual competition',
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading current settings…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-2xl font-bold">Competition Controls</h1>
            <div className="space-y-2">
                {toggles.map((name, idx) => {
                    const index = idx + 1;
                    return (
                        <button
                            key={index}
                            onClick={() => handleToggleClick(index)}
                            className={`px-4 py-2 rounded-lg border mr-2 ${
                                activeIndex === index
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-black'
                            }`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}