// app/api/update-competition/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Force dynamic to always read/write the latest state
export const dynamic = 'force-dynamic';

// GET: Retrieve the current competition state
export async function GET() {
    try {
        const state = await prisma.globalState.findUnique({
            where: { id: 1 },
        });
        return NextResponse.json(state ?? { id: 1, competition: 0 });
    } catch (error) {
        console.error('Error fetching competition state:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Update the competition state
export async function POST(request: NextRequest) {
    try {
        const { competition } = await request.json();
        if (typeof competition !== 'number') {
            return NextResponse.json(
                { error: 'Invalid competition value' },
                { status: 400 }
            );
        }

        const state = await prisma.globalState.upsert({
            where: { id: 1 },
            update: { competition },
            create: { competition },
        });

        return NextResponse.json(state);
    } catch (error) {
        console.error('Error updating competition state:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
