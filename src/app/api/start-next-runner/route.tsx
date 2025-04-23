// app/api/create-lap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// Force dynamic to always read/write the latest state
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

        // Fetch current competition from GlobalState
        const globalState = await prisma.globalState.findUnique({
            where: { id: 1 },
        });
        const compNr = globalState?.competition ?? 0;

        // Create a new lap entry for the runner, including current competition
        const newLap = await prisma.lap.create({
            data: {
                runnerId: runner.id,
                competition: compNr,         // Pulled from GlobalState
                startTime: new Date(),
                time: 'null',          // Default value
                raining: false,      // Default value, can be updated later
            },
        });

        return NextResponse.json({
            message: 'Lap created successfully',
            lap: newLap,
        });
    } catch (error) {
        console.error('Error creating lap:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
