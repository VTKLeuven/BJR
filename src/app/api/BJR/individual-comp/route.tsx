import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to format seconds (float) to M:SS.ms
function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const wholeSec = Math.floor(secs);
    const ms = Math.floor((secs - wholeSec) * 1000);
    const paddedSec = wholeSec.toString().padStart(2, '0');
    const paddedMs = ms.toString().padStart(3, '0');
    return `${minutes}:${paddedSec}.${paddedMs}`;
}

// Helper to format Date to HH:MM:SS
function formatCurrentTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Parse a lap time string "M:SS.ms" into seconds
function parseLapTime(time: string): number {
    const [minPart, secPart] = time.split(':');
    const [sec, ms] = secPart.split('.');
    return Number(minPart) * 60 + Number(sec) + Number(ms) / 1000;
}

export async function GET() {
    try {
        const now = new Date();
        const currentTime = formatCurrentTime(now);

        // Fetch all runners with their laps
        const runners = await prisma.runner.findMany({ include: { laps: true } });
        const finished = runners.filter(r => r.laps.length > 0 && r.laps.every(l => l.time !== 'null'));

        // Fetch active laps (time == 'null') indicating currently running
        const activeLaps = await prisma.lap.findMany({
            where: { time: 'null' },
            include: { runner: true }
        });

        // Collect runner IDs from finished and active sets
        const kringIds = Array.from(new Set([
            ...finished.map(r => r.kringId),
            ...activeLaps.map(l => l.runner.kringId)
        ]));

        // Load kring names
        const krings = await prisma.kring.findMany({ where: { id: { in: kringIds } } });
        const kringById = Object.fromEntries(krings.map(k => [k.id, k.name]));

        // Compute best lap per finished runner
        const withBest = finished.map(r => {
            const bestSeconds = Math.min(...r.laps.map(l => parseLapTime(l.time)));
            return { ...r, bestSeconds };
        });

        // Sort by best time asc
        const sortedFinished = withBest.sort((a, b) => a.bestSeconds - b.bestSeconds);

        // Top 10 finished
        const topRunners = sortedFinished.slice(0, 10).map(r => ({
            id: r.id.toString(),
            name: `${r.firstName} ${r.lastName}`,
            kringId: r.kringId.toString(),
            kringName: kringById[r.kringId] || 'Unknown',
            imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
            time: formatTime(r.bestSeconds),
            bestTime: formatTime(r.bestSeconds)
        }));

        // All finished as previous
        const previousRunners = sortedFinished.map(r => ({
            id: r.id.toString(),
            name: `${r.firstName} ${r.lastName}`,
            kringId: r.kringId.toString(),
            kringName: kringById[r.kringId] || 'Unknown',
            imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
            time: formatTime(r.bestSeconds),
            bestTime: formatTime(r.bestSeconds)
        }));

        // Active runners: each active lap indicates a runner currently running
        const seen = new Set<string>();
        const activeRunners = activeLaps.map(l => {
            const r = l.runner;
            if (seen.has(r.id.toString())) return null;
            seen.add(r.id.toString());
            const elapsedSec = (now.getTime() - new Date(l.startTime).getTime()) / 1000;
            return {
                id: r.id.toString(),
                name: `${r.firstName} ${r.lastName}`,
                kringId: r.kringId.toString(),
                kringName: kringById[r.kringId] || 'Unknown',
                imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
                currentTime: formatTime(elapsedSec)
            };
        }).filter(Boolean) as Array<{
            id: string;
            name: string;
            kringId: string;
            kringName: string;
            imageUrl: string;
            currentTime: string;
        }>;

        const data = { currentTime, topRunners, activeRunners, previousRunners };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/BJR/individual-comp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
