'use client';
import { useState, useRef } from "react";

export default function FinishPage() {
    const [identification, setIdentification] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const submitIdentification = (id: string) => {
        if (id.trim()) {
            fetch("/api/stop-runner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identification: id }),
            })
                .then((response) => {
                    if (response.ok) {
                        setIdentification("");
                        inputRef.current?.focus();
                    } else {
                        console.error("Failed to stop runner");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            let trimmed = identification;
            const semicolonIndex = identification.indexOf(";");

            // If there's a semicolon, cut the string to 14 chars before it
            if (semicolonIndex !== -1) {
                trimmed = identification.slice(0, semicolonIndex).slice(0, 14);
            } else {
                // Just trim to 14 max if no semicolon
                trimmed = identification.slice(0, 14);
            }

            submitIdentification(trimmed);
            e.preventDefault();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIdentification(e.target.value);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 style={{ fontSize: "3rem", fontWeight: "500" }}>Finish</h1>
            <input
                ref={inputRef}
                type="text"
                placeholder="Enter Identification"
                value={identification}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border p-2 text-center"
            />
        </div>
    );
}