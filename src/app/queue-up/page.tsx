'use client'
import { useState } from "react";

export default function Page() {
    const [runner, setRunner] = useState({
        firstName: "",
        lastName: "",
        identification: "",
        faculty: "",
        registrationTime: "",
        groupNumber: "",
        testTime: "",
        firstYear: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setRunner({
            ...runner,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch("/api/add-runner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...runner,
                registrationTime: new Date(runner.registrationTime).toISOString(),
                groupNumber: parseInt(runner.groupNumber, 10),
                testTime: runner.testTime ? parseFloat(runner.testTime) : null,
            }),
        });
        if (response.ok) {
            alert("Runner added successfully!");
            setRunner({
                firstName: "",
                lastName: "",
                identification: "",
                faculty: "",
                registrationTime: "",
                groupNumber: "",
                testTime: "",
                firstYear: false,
            });
        } else {
            alert("Failed to add runner.");
        }
    };

    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="p-4 mx-auto max-w-lg w-full">
                <h1 className="text-xl font-bold mb-4">Queue Up</h1>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <input type="text" name="firstName" placeholder="First Name" value={runner.firstName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="lastName" placeholder="Last Name" value={runner.lastName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="identification" placeholder="Identification Number"
                           value={runner.identification} onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="faculty" placeholder="Faculty" value={runner.faculty}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="datetime-local" name="registrationTime" value={runner.registrationTime}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="number" name="groupNumber" placeholder="Group Number" value={runner.groupNumber}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="number" step="0.01" name="testTime" placeholder="Test Time (Optional)"
                           value={runner.testTime} onChange={handleChange} className="border p-2"/>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="firstYear" checked={runner.firstYear} onChange={handleChange}/>
                        <span>First Year</span>
                    </label>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Runner</button>
                </form>
            </div>
        </div>
    );
}