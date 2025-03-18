import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // Fetch the raining state from the database
        const globalState = await prisma.globalState.findUnique({
            where: { id: 1 },
        });

        if (!globalState) {
            return NextResponse.json({ error: 'Global state not found' }, { status: 500 });
        }

        const raining = globalState.raining;


        // Fetch the most recent lap before creating a new one
        const previousLap = await prisma.lap.findFirst({
            orderBy: { startTime: 'desc' },
            include: { runner: true },
        });

        const nextRunnerInQueue = await prisma.queue.findFirst({
            orderBy: { queuePlace: 'asc' },
            include: { runner: { include: { laps: true } } },
        });

        if (!nextRunnerInQueue) {
            return NextResponse.json({ error: 'No next runner in queue' }, { status: 400 });
        }

        await prisma.lap.create({
            data: {
                startTime: new Date(),
                runnerId: nextRunnerInQueue.runnerId,
                raining: raining,
                time: 'null', // Default value
            },
        });

        await prisma.queue.delete({
            where: { id: nextRunnerInQueue.id },
        });

        let lapTime = null;
        if (previousLap) {
            const startTime = new Date(previousLap.startTime).getTime();
            const currentTime = Date.now();
            const timeDiff = currentTime - startTime;
            const minutes = Math.floor(timeDiff / 60000);
            const seconds = Math.floor((timeDiff % 60000) / 1000);
            const hundreds = Math.floor((timeDiff % 1000) / 10);
            lapTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${hundreds < 10 ? '0' : ''}${hundreds}`;

            // Update the lap time in the database
            await prisma.lap.update({
                where: { id: previousLap.id },
                data: { time: lapTime }, // Store time in hundreds of milliseconds
            });
        }

        return NextResponse.json({
            message: 'Next runner started successfully',
        });
    } catch (error) {
        console.error('Error starting next runner:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}