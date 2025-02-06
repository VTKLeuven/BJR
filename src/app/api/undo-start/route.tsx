import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // Find the most recently created lap (which we want to undo)
        const lastLap = await prisma.lap.findFirst({
            orderBy: { startTime: 'desc' },
        });

        if (!lastLap) {
            return NextResponse.json({ error: 'No recent lap to undo' }, { status: 400 });
        }

        // Find the smallest queuePlace value in the queue
        const firstQueueEntry = await prisma.queue.findFirst({
            orderBy: { queuePlace: 'asc' },
        });

        const newQueuePlace = firstQueueEntry ? firstQueueEntry.queuePlace - 1 : 1;

        // Restore the runner back to the queue at the front
        await prisma.queue.create({
            data: {
                runnerId: lastLap.runnerId,
                queuePlace: newQueuePlace,
            },
        });

        // Delete the last created lap (undoing its creation)
        await prisma.lap.delete({
            where: { id: lastLap.id },
        });

        // Find the lap before the lastLap to reset its time if needed
        const currentLap = await prisma.lap.findFirst({
            orderBy: { startTime: 'desc' },
        });

        if (currentLap) {
            // Reset the time field to null (or original state)
            await prisma.lap.update({
                where: { id: currentLap.id },
                data: { time: 'null' },
            });
        }

        return NextResponse.json({
            message: 'Undo successful',
        });
    } catch (error) {
        console.error('Error undoing last lap:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
