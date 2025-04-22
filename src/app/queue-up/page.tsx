'use client'
import { useState, useEffect } from "react";
import { Runner, Group, Kring } from '@prisma/client';

export default function Page() {
    const [runner, setRunner] = useState({
        firstName: "",
        lastName: "",
        identification: "",
        kringId: "",
        groupNumber: "",
        testTime: "",
        firstYear: false,
    });

    const [groups, setGroups] = useState<Group[]>([]);
    const [kringen, setKringen] = useState<Kring[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Runner[]>([]);
    const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
    const [showResults, setShowResults] = useState(false);

    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    useEffect(() => {
        async function fetchGroups() {
            const response = await fetch("/api/groups");
            const data: Group[] = await response.json();
            setGroups(data);
        }

        async function fetchKringen() {
            const response = await fetch("/api/kringen");
            const data: Kring[] = await response.json();
            setKringen(data);
        }

        fetchGroups();
        fetchKringen();
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
            setShowResults(true);
        };

        handleSearch();
    }, [searchQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setRunner({ ...runner, [name]: checked });
        } else {
            setRunner({ ...runner, [name]: value });
        }
    };

    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedRunner(null);
        setShowResults(true);
    };

    const handleSearchFocus = () => setShowResults(true);

    const handleRunnerClick = (runner: Runner) => {
        setSelectedRunner(runner);
        setSearchQuery(`${runner.firstName} ${runner.lastName}`);
        setTimeout(() => setShowResults(false), 100);
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
                kringId: parseInt(runner.kringId, 10),
            }),
        });
        if (response.ok) {
            const newRunner = await response.json();
            alert("Runner added successfully!");
            setRunner({
                firstName: "",
                lastName: "",
                identification: "",
                kringId: "",
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

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;

        const response = await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupName: newGroupName }),
        });

        if (response.ok) {
            const createdGroup = await response.json();
            setGroups(prev => [...prev, createdGroup]);
            setRunner(prev => ({ ...prev, groupNumber: String(createdGroup.groupNumber) }));
            setShowGroupModal(false);
            setNewGroupName("");
        } else {
            alert("Failed to create group");
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
                    <select name="kringId" value={runner.kringId} onChange={handleChange} required
                            className="border p-2">
                        <option value="" disabled>Select Kring</option>
                        {kringen.map(kring => (
                            <option key={kring.id} value={kring.id}>
                                {kring.name}
                            </option>
                        ))}
                    </select>
                    <div>
                        <select name="groupNumber" value={runner.groupNumber} onChange={handleChange} required
                                className="border p-2 w-full">
                            <option value="" disabled>Select Group</option>
                            {groups.map(group => (
                                <option key={group.groupNumber} value={group.groupNumber}>
                                    {group.groupName}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowGroupModal(true)}
                            className="mt-2 text-sm text-blue-600 underline"
                        >
                            + Create New Group
                        </button>
                    </div>
                    <input type="text" name="testTime" placeholder="Test Time (mm:ss)" pattern="\d{2}:\d{2}"
                           value={runner.testTime} onChange={handleChange} className="border p-2"/>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="firstYear" checked={runner.firstYear} onChange={handleChange}/>
                        <span>First Year</span>
                    </label>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Runner</button>
                </form>
            </div>

            {showGroupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-bold mb-4">Create New Group</h2>
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="border p-2 w-full mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                                Cancel
                            </button>
                            <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-500 text-white rounded">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
