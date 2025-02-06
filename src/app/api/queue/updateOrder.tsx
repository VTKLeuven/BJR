import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const updatedQueue = await request.json();

    try {
        const updatePromises = updatedQueue.map((item: { runnerId: number, queuePlace: number }) =>
            prisma.queue.update({
                where: { queuePlace: item.queuePlace },
                data: { runnerId: item.runnerId },
            })
        );

        await Promise.all(updatePromises);

        return NextResponse.json({ message: 'Queue order updated successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to update queue order' }, { status: 500 });
    }
}