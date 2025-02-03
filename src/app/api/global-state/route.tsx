import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const globalState = await prisma.globalState.findUnique({
            where: { id: 1 },
        });
        return NextResponse.json(globalState);
    } catch (error) {
        console.error('Error fetching global state:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { raining } = await req.json();

    try {
        const updatedGlobalState = await prisma.globalState.update({
            where: { id: 1 },
            data: { raining },
        });
        return NextResponse.json(updatedGlobalState);
    } catch (error) {
        console.error('Error updating global state:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}