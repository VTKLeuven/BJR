// app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const groups = await prisma.group.findMany();
        return NextResponse.json(groups);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
}