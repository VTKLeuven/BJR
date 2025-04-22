import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { identification } = await request.json();

        if (!identification) {
            return NextResponse.json({ error: 'Identification is required' }, { status: 400 });
        }

        // Find the runner with the given identification string
        const runner = await prisma.runner.findUnique({
            where: { identification },
        });

        if (!runner) {
            return NextResponse.json({ error: 'Runner not found' }, { status: 404 });
        }

        // Create a new lap entry for the runner
        const newLap = await prisma.lap.create({
            data: {
                runnerId: runner.id,
                startTime: new Date(),
                time: 'null', // Default value
                raining: false, // Default value, can be updated later
            },
        });

        return NextResponse.json({
            message: 'Lap created successfully',
            lap: newLap,
        });
    } catch (error) {
        console.error('Error creating lap:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}