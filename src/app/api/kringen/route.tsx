import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const kringen = await prisma.kring.findMany();
        return NextResponse.json(kringen);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 });
    }
}