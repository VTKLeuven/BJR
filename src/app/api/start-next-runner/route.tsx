import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { raining } = await req.json();

    try {
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

        const updatedRunner = await prisma.runner.findUnique({
            where: { id: nextRunnerInQueue.runnerId },
            include: { laps: true },
        });

        await prisma.queue.delete({
            where: { queuePlace: nextRunnerInQueue.queuePlace },
        });

        const nextRunner = await prisma.queue.findFirst({
            orderBy: { queuePlace: 'asc' },
            include: { runner: { include: { laps: true } } },
        });

        let previousRunner = null;
        let lapTime = null;
        if (previousLap) {
            previousRunner = previousLap.runner;
            const startTime = new Date(previousLap.startTime).getTime();
            const currentTime = Date.now();
            const timeDiff = currentTime - startTime;
            const minutes = Math.floor(timeDiff / 60000);
            const seconds = Math.floor((timeDiff % 60000) / 1000);
            lapTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Update the lap time in the database
            await prisma.lap.update({
                where: { id: previousLap.id },
                data: { time: lapTime }, // Store time in seconds
            });
        }

        return NextResponse.json({
            currentRunner: updatedRunner,
            nextRunner: nextRunner ? nextRunner.runner : null,
            previousRunner: previousRunner ? {
                ...previousRunner,
                lapTime: lapTime,
            } : null,
            raining: raining,
        });
    } catch (error) {
        console.error('Error starting next runner:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}