import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const faculties = await prisma.faculty.findMany();
        return NextResponse.json(faculties);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 });
    }
}