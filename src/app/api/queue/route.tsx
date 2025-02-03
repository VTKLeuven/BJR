import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const queue = await prisma.queue.findMany({
            include: {
                runner: true,
            },
            orderBy: {
                queuePlace: 'asc',
            },
        });
        return NextResponse.json(queue);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
    }
}