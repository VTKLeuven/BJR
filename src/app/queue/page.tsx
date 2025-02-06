'use client'
import { useState, useEffect } from "react";
import { Queue, Runner } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface QueueWithRunner extends Queue {
    runner: Runner;
}

export default function QueuePage() {
    const [queue, setQueue] = useState<QueueWithRunner[]>([]);

    useEffect(() => {
        async function fetchQueue() {
            const response = await fetch("/api/queue");
            const data = await response.json();
            if (Array.isArray(data)) {
                setQueue(data);
            } else {
                setQueue([]);
                console.error("API response is not an array or is empty:", data);
            }
        }

        fetchQueue();
    }, []);

    const handleDelete = async (queuePlace: number) => {
        try {
            const response = await fetch(`/api/queue?queuePlace=${queuePlace}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setQueue(queue.filter(entry => entry.queuePlace !== queuePlace));
            } else {
                console.error("Failed to delete runner from queue");
            }
        } catch (error) {
            console.error("Error deleting runner from queue:", error);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const updatedQueue = Array.from(queue);
        const [movedItem] = updatedQueue.splice(result.source.index, 1);
        updatedQueue.splice(result.destination.index, 0, movedItem);

        setQueue(updatedQueue);

        try {
            await fetch('/api/queue/updateOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedQueue.map((item, index) => ({
                    id: item.queuePlace,
                    queuePlace: index + 1,
                }))),
            });
        } catch (error) {
            console.error("Error updating queue order:", error);
        }
    };

    return (
        <div className="p-4 mx-auto max-w-lg w-full">
            <h1 className="text-xl font-bold mb-4">Queue</h1>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="queue" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false} direction="vertical">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef}>
                            {queue.map((entry, index) => (
                                <Draggable key={entry.id} draggableId={entry.id.toString()} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="border p-2 mb-2 flex justify-between items-center"
                                        >
                                            <span>{index + 1}. {entry.runner.firstName} {entry.runner.lastName}</span>
                                            <button onClick={() => handleDelete(entry.queuePlace)} className="text-red-500 ml-auto">
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}