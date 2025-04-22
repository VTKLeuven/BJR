'use client';
import { useState, useRef } from "react";

export default function FinishPage() {
    const [identification, setIdentification] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && identification.trim()) {
            // Send the identification to the API
            fetch("/api/stop-runner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identification }),
            })
                .then((response) => {
                    if (response.ok) {
                        setIdentification(""); // Reset input field after sending
                        inputRef.current?.focus(); // Focus the input field
                    } else {
                        console.error("Failed to stop runner");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 style={{ fontSize: "3rem", fontWeight: "500" }}>Finish</h1>
            <input
                ref={inputRef}
                type="text"
                placeholder="Enter Identification"
                value={identification}
                onChange={(e) => setIdentification(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border p-2 text-center"
            />
        </div>
    );
}