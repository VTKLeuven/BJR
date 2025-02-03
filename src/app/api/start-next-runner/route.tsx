import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { raining } = await req.json();

    try {
        const nextRunnerInQueue = await prisma.queue.findFirst({
            orderBy: { queuePlace: 'asc' },
            include: { runner: { include: { laps: true } } },
        });

        if (!nextRunnerInQueue) {
            return NextResponse.json({ error: 'No next runner in queue' }, { status: 400 });
        }

        await prisma.$executeRaw`UPDATE Runner SET startTime = ${new Date().toISOString()} WHERE id = ${nextRunnerInQueue.runnerId}`;

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

        const previousRunner = await prisma.runner.findFirst({
            where: { id: nextRunnerInQueue.runnerId },
            include: { laps: true },
        });

        return NextResponse.json({
            currentRunner: updatedRunner,
            nextRunner: nextRunner ? nextRunner.runner : null,
            previousRunner: previousRunner ? {
                ...previousRunner,
                lapTime: previousRunner.laps[0]?.time,
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