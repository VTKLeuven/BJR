'use client';
import { useState, useRef } from "react";

export default function StartPage() {
    const [identification, setIdentification] = useState("");
    const [countdown, setCountdown] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && identification.trim()) {
            // Start the countdown
            setCountdown(5);
            const interval = setInterval(async () => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);

                        // Send the identification to the API after 5 seconds
                        fetch("/api/start-next-runner", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ identification }),
                        }).then(() => {
                            setIdentification(""); // Reset input field after sending
                            inputRef.current?.focus(); // Focus the input field
                        });

                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
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
                    onChange={(e) => setIdentification(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border p-2 text-center"
                />
            )}
        </div>
    );
}