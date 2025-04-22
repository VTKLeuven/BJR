// app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const groups = await prisma.group.findMany();
        return NextResponse.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request: Request) {
    try {
        const { groupName, groupNumber } = await request.json();

        if (!groupName) {
            return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
        }

        // If no group number provided, find the next available one
        let nextGroupNumber = groupNumber;
        if (nextGroupNumber === undefined) {
            const maxGroup = await prisma.group.findFirst({
                orderBy: {
                    groupNumber: 'desc'
                }
            });

            nextGroupNumber = maxGroup ? maxGroup.groupNumber + 1 : 1;
        }

        const newGroup = await prisma.group.create({
            data: {
                groupName,
                groupNumber: nextGroupNumber
            },
        });

        return NextResponse.json(newGroup, { status: 201 });
    } catch (error: any) {
        console.error('Error creating group:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'A group with this number already exists'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}