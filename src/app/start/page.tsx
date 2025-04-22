'use client';
import { useState, useRef } from "react";

export default function StartPage() {
    const [identification, setIdentification] = useState("");
    const [countdown, setCountdown] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (!identification.trim()) return;

        setCountdown(5);
        const interval = setInterval(async () => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    fetch("/api/start-next-runner", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ identification }),
                    }).then(() => {
                        setIdentification("");
                        inputRef.current?.focus();
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 14) {
            setIdentification(value);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (identification.length === 14 && e.key.length === 1) {
            e.preventDefault(); // Prevent the 15th character from being entered
            handleSubmit();     // Trigger submit
        } else if (e.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 style={{ fontSize: "3rem", fontWeight: "500" }}>Start</h1>
            {countdown > 0 ? (
                <h1 style={{ fontSize: "8rem", fontWeight: "800" }}>{countdown}</h1>
            ) : (
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter Identification"
                    value={identification}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="border p-2 text-center"
                />
            )}
        </div>
    );
}