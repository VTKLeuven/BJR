'use client'
import { useState } from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/DEV-ONLY-RESET', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.message) {
                alert(data.message);
            } else {
                alert('Reset failed');
            }
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('Error resetting data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Home</h1>
            <p>Hallo</p>
            <button onClick={handleReset} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
                {loading ? 'Resetting...' : 'Reset Data'}
            </button>
        </div>
    );
}