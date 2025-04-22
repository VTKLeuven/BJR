'use client'
import { useState, useEffect } from "react";
import { Group, Kring } from '@prisma/client';

export default function Page() {
    const [runner, setRunner] = useState({
        firstName: "",
        lastName: "",
        identification: "",
        kringId: "0",
        groupNumber: "0",
        testTime: "",
        firstYear: false,
    });

    const [groups, setGroups] = useState<Group[]>([]);
    const [kringen, setKringen] = useState<Kring[]>([]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setRunner({ ...runner, [name]: checked });
        } else {
            setRunner({ ...runner, [name]: value });
        }
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
            await response.json()
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
        } else {
            alert("Failed to add runner.");
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
                <h1 className="text-xl font-bold mb-4">Register runners</h1>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <input type="text" name="firstName" placeholder="First Name" value={runner.firstName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="lastName" placeholder="Last Name" value={runner.lastName}
                           onChange={handleChange} required className="border p-2"/>
                    <input type="text" name="identification" placeholder="Identification Number"
                           value={runner.identification} onChange={handleChange} required className="border p-2"/>
                    <select name="kringId" value={runner.kringId} onChange={handleChange} required
                            className="border p-2">
                        <option value="0" disabled>No Kring</option>
                        {kringen.map(kring => (
                            <option key={kring.id} value={kring.id}>
                                {kring.name}
                            </option>
                        ))}
                    </select>
                    <div>
                        <select
                            name="groupNumber"
                            value={runner.groupNumber}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        >
                            <option value="0">No Group (default)</option> {/* Added default option */}
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
