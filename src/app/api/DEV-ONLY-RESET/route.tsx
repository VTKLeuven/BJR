import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // Clear all entries in the laps table
        await prisma.lap.deleteMany({});

        // Clear all entries in the queue table
        await prisma.queue.deleteMany({});

        // Get the first 3 runners
        const runners = await prisma.runner.findMany({
            take: 3,
            orderBy: { id: 'asc' },
        });

        // Add the first 3 runners to the queue
        for (let i = 0; i < runners.length; i++) {
            await prisma.queue.create({
                data: {
                    runnerId: runners[i].id,
                    queuePlace: i + 1,
                },
            });
        }

        return NextResponse.json({ message: 'Reset successful' }, { status: 200 });
    } catch (error) {
        console.error('Error resetting data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}