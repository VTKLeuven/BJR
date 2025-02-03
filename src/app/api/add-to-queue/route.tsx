import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { runnerId } = await req.json();

    if (!runnerId) {
        return NextResponse.json({ error: 'Runner ID is required' }, { status: 400 });
    }

    try {
        const newQueueEntry = await prisma.queue.create({
            data: {
                runnerId: runnerId,
            },
        });

        return NextResponse.json(newQueueEntry, { status: 200 });
    } catch (error) {
        console.error('Error adding runner to queue:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}