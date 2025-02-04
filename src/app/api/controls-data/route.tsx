import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const lastLap = await prisma.lap.findFirst({
            orderBy: { startTime: 'asc' },
            select: { runnerId: true },
        });

        const previousRunner = lastLap
            ? await prisma.runner.findUnique({
                where: { id: lastLap.runnerId },
                include: { laps: true },
            })
            : null;

        const firstLap = await prisma.lap.findFirst({
            orderBy: { startTime: 'desc' },
            select: { runnerId: true },
        });

        const currentRunner = firstLap
            ? await prisma.runner.findUnique({
                where: { id: firstLap.runnerId },
                include: { laps: true },
            })
            : null;

        const nextRunnerInQueue = await prisma.queue.findFirst({
            orderBy: { queuePlace: 'asc' },
            include: { runner: { include: { laps: true } } },
        });

        const globalState = await prisma.globalState.findUnique({
            where: { id: 1 },
        });

        return NextResponse.json({
            previousRunner: previousRunner ? {
                ...previousRunner,
                lapTime: previousRunner.laps?.[0]?.time, // Ensuring laps is accessed as an array
            } : null,
            currentRunner: currentRunner ? {
                ...currentRunner,
                startTime: currentRunner.laps?.[0]?.startTime, // Same fix
            } : null,
            nextRunner: nextRunnerInQueue ? nextRunnerInQueue.runner : null,
            raining: globalState?.raining || false,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}