import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { identification } = await request.json();

        if (!identification) {
            return NextResponse.json({ error: 'Identification is required' }, { status: 400 });
        }

        // Find the runner by identification
        const runner = await prisma.runner.findUnique({
            where: { identification },
        });

        if (!runner) {
            return NextResponse.json({ error: 'Runner not found' }, { status: 404 });
        }

        // Find the last open lap for the runner
        const openLap = await prisma.lap.findFirst({
            where: {
                runnerId: runner.id,
                time: 'null', // Open lap
            },
            orderBy: { startTime: 'desc' },
        });

        if (!openLap) {
            return NextResponse.json({ error: 'No open lap found for this runner' }, { status: 400 });
        }

        // Calculate the lap time
        const startTime = new Date(openLap.startTime).getTime();
        const currentTime = Date.now();
        const timeDiff = currentTime - startTime;
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        const hundreds = Math.floor((timeDiff % 1000) / 10);
        const lapTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${hundreds < 10 ? '0' : ''}${hundreds}`;

        // Update the lap with the calculated time
        await prisma.lap.update({
            where: { id: openLap.id },
            data: { time: lapTime },
        });

        return NextResponse.json({
            message: 'Lap ended successfully',
            lapTime,
        });
    } catch (error) {
        console.error('Error stopping runner:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}