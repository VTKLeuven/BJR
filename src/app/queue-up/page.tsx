'use client'
import { useState, useEffect } from "react";
import { Runner, Group, Faculty } from '@prisma/client';

export default function Page() {
    const [runner, setRunner] = useState({
        firstName: "",
        lastName: "",
        identification: "",
        facultyId: "",
        groupNumber: "",
        testTime: "",
        firstYear: false,
    });

    const [groups, setGroups] = useState<Group[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Runner[]>([]);
    const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
    const [showResults, setShowResults] = useState(false);  // NEW STATE

    useEffect(() => {
        async function fetchGroups() {
            const response = await fetch("/api/groups");
            const data: Group[] = await response.json();
            setGroups(data);
        }

        async function fetchFaculties() {
            const response = await fetch("/api/faculties");
            const data: Faculty[] = await response.json();
            setFaculties(data);
        }

        fetchGroups();
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }

        const handleSearch = async () => {
            const terms = searchQuery.split(" ").map(term => term.trim()).filter(term => term);
            const response = await fetch(`/api/search?terms=${encodeURIComponent(JSON.stringify(terms))}`);
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);  // Show results when a search is performed
        };

        handleSearch();
    }, [searchQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setRunner({
                ...runner,
                [name]: checked,
            });
        } else {
            setRunner({
                ...runner,
                [name]: value,
            });
        }
    };

    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedRunner(null);
        setShowResults(true);  // Show results when typing
    };

    const handleSearchFocus = () => {
        setShowResults(true);  // Ensure results reappear when clicking input
    };

    const handleRunnerClick = (runner: Runner) => {
        setSelectedRunner(runner);
        setSearchQuery(`${runner.firstName} ${runner.lastName}`);

        // Delay hiding results slightly to ensure UI updates properly
        setTimeout(() => {
            setShowResults(false);
        }, 100);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch("/api/add-runner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...runner,
                groupNumber: parseInt(runner.groupNumber, 10),
                testTime: runner.testTime ? parseFloat(runner.testTime.replace(":", ".")) : null,
                facultyId: parseInt(runner.facultyId, 10),
            }),
        });
        if (response.ok) {
            const newRunner = await response.json();
            alert("Runner added successfully!");
            setRunner({
                firstName: "",
                lastName: "",
                identification: "",
                facultyId: "",
                groupNumber: "",
                testTime: "",
                firstYear: false,
            });
            addToQueue(newRunner);
        } else {
            alert("Failed to add runner.");
        }
    };

    const addToQueue = async (runner: Runner) => {
        const response = await fetch("/api/add-to-queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runnerId: runner.id }),
        });
        if (response.ok) {
            alert("Runner added to queue successfully!");
        } else {
            alert("Failed to add runner to queue.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <div className="p-4 mx-auto max-w-lg w-full">
                <h1 className="text-xl font-bold mb-4">Queue Up</h1>

                <h4 className="text-l font-bold mb-4">Add existing runner</h4>
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Search by First Name, Last Name, or ID"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        onFocus={handleSearchFocus}
                        className="border p-2 w-full"
                    />
                    {showResults && searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-t-0 shadow-lg">
                            {searchResults.map((result) => (
                                <li
                                    key={result.id}
                                    className={`p-2 cursor-pointer ${selectedRunner?.id === result.id ? 'bg-gray-200' : ''}`}
                                    onClick={() => handleRunnerClick(result)}
                                >
                                    {result.firstName} {result.lastName} - {result.identification}
                                </li>
                            ))}
                        </ul>
                    )}
                    {selectedRunner && (
                        <button
                            onClick={() => addToQueue(selectedRunner)}
                            className="mt-2 bg-blue-500 text-white p-2 rounded"
                        >
                            Add to Queue
                        </button>
                    )}
                </div>

                <h4 className="text-l font-bold mb-4">Add new runner</h4>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <input type="text" name="firstName" placeholder="First Name" value={runner.firstName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="lastName" placeholder="Last Name" value={runner.lastName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="identification" placeholder="Identification Number"
                           value={runner.identification} onChange={handleChange} required className="border p-2"/>
                    <select name="facultyId" value={runner.facultyId} onChange={handleChange} required
                            className="border p-2">
                        <option value="" disabled>Select Faculty</option>
                        {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                    <select name="groupNumber" value={runner.groupNumber} onChange={handleChange} required
                            className="border p-2">
                        <option value="" disabled>Select Group</option>
                        {groups.map(group => (
                            <option key={group.groupNumber} value={group.groupNumber}>
                                {group.groupName}
                            </option>
                        ))}
                    </select>
                    <input type="text" name="testTime" placeholder="Test Time (mm:ss)" pattern="\d{2}:\d{2}"
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