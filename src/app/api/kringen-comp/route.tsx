import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Response types matching frontend interfaces
interface KringResponse {
    id: string;
    name: string;
    logoUrl: string;
    averageTime: string; // M:SS.ms
}

interface RunnerResponse {
    id: string;
    name: string;
    kringId: string;
    kringName: string;
    imageUrl: string;
    time: string; // MM:SS.ms
}

interface CompetitionData {
    countdownTime: string;      // MM:SS.ms
    totalRuns: number;
    activeKrings: KringResponse[];
    activeRunners: { [kringId: string]: RunnerResponse[] };
    leaderboard: KringResponse[];
    previousRunners: RunnerResponse[];
}

// Safely parse a time string "MM:SS.ms" or "M:SS.ms" into milliseconds
function parseTimeString(timeStr?: string): number {
    if (typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const [minPart, secMs = '0.00'] = parts;
    const mins = parseInt(minPart, 10) || 0;
    const [secPart = '0', msPart = '00'] = secMs.split('.');
    const secs = parseInt(secPart, 10) || 0;
    const msNum = parseInt(msPart.padEnd(2, '0').slice(0, 2), 10) || 0;
    return mins * 60000 + secs * 1000 + msNum * 10;
}

// Format milliseconds into "M:SS.ms" (minutes 1+ digits, seconds 2 digits, hundredths)
function formatMsToTime(ms: number): string {
    if (ms < 0) ms = 0;
    const minutes = Math.floor(ms / 60000);
    const remainder = ms % 60000;
    const seconds = Math.floor(remainder / 1000);
    const hundredths = Math.floor((remainder % 1000) / 10);
    const secStr = seconds.toString().padStart(2, '0');
    const msStr = hundredths.toString().padStart(2, '0');
    return `${minutes}:${secStr}.${msStr}`;
}

export async function GET() {
    try {
        const now = new Date();

        // Calculate countdown to next full minute
        const nextMinute = new Date(now);
        nextMinute.setSeconds(0, 0);
        nextMinute.setMinutes(now.getMinutes() + 1);
        const diff = nextMinute.getTime() - now.getTime();
        const countdownTime = formatMsToTime(diff);

        // Only consider laps from kringen VTK and Apolloon
        const allowedKrings = await prisma.kring.findMany({
            where: { name: { in: ['VTK', 'Apolloon'] } }
        });
        const allowedKringIds = allowedKrings.map(k => k.id);

        // Fetch all laps for those kringen, including runner for grouping
        const allLaps = await prisma.lap.findMany({
            where: { runnerId: { in: await prisma.runner.findMany({ where: { kringId: { in: allowedKringIds } }, select: { id: true } }).then(rs => rs.map(r => r.id)) } },
            include: { runner: true }
        });

        // Total runs is simply the length of allLaps
        const totalRuns = allLaps.length;

        // Group laps by kringId
        const lapsByKring: Record<number, typeof allLaps> = {};
        allLaps.forEach(lap => {
            const kId = (lap.runner).kringId;
            if (!lapsByKring[kId]) lapsByKring[kId] = [];
            lapsByKring[kId].push(lap);
        });

        // Build active kringen with average times
        const activeKrings: KringResponse[] = [];
        const kringNameMap: Record<number, string> = {};

        for (const kring of allowedKrings) {
            kringNameMap[kring.id] = kring.name;
            const laps = lapsByKring[kring.id] || [];
            if (laps.length === 0) continue;

            const totalMs = laps.reduce((sum, lap) => sum + parseTimeString(lap.time), 0);
            const avgMs = totalMs / laps.length;

            activeKrings.push({
                id: kring.id.toString(),
                name: kring.name,
                logoUrl: `/kringen/${kring.name.replaceAll(' ', '')}.png`,
                averageTime: formatMsToTime(avgMs)
            });
        }

        // Leaderboard: sort by ascending averageTime
        const leaderboard = [...activeKrings].sort(
            (a, b) => parseTimeString(a.averageTime) - parseTimeString(b.averageTime)
        );

        // Active runners: runners who have a pending lap (time === null)
        // First get all pending laps for runners in allowed kringen
        const pendingLaps = await prisma.lap.findMany({
            where: {
                runnerId: { in: await prisma.runner.findMany({ where: { kringId: { in: allowedKringIds } }, select: { id: true } }).then(rs => rs.map(r => r.id)) },
                time: 'null'
            }
        });
        const uniqueRunnerIds = Array.from(new Set(pendingLaps.map(l => l.runnerId)));
        // Fetch those runners
        const pendingRunners = await prisma.runner.findMany({
            where: { id: { in: uniqueRunnerIds } }
        });
        const activeRunners: Record<string, RunnerResponse[]> = {};
        for (const runner of pendingRunners) {
            const krId = runner.kringId;
            const name = `${runner.firstName} ${runner.lastName}`;
            const runnerResp: RunnerResponse = {
                id: runner.id.toString(),
                name,
                kringId: krId.toString(),
                kringName: kringNameMap[krId] || '',
                imageUrl: `/kringen/${kringNameMap[krId].replaceAll(' ', '')}.png`,
                time: '0:00.00'
            };
            if (!activeRunners[krId]) activeRunners[krId] = [];
            activeRunners[krId].push(runnerResp);
        }

        // Previous runners: last 5 laps for allowed kringen
        const recentLaps = await prisma.lap.findMany({
            where: { runnerId: { in: await prisma.runner.findMany({ where: { kringId: { in: allowedKringIds } }, select: { id: true } }).then(rs => rs.map(r => r.id)) } },
            orderBy: { startTime: 'desc' },
            take: 5,
            include: { runner: true }
        });

        const previousRunners: RunnerResponse[] = recentLaps.map(lap => {
            const runner = lap.runner;
            const name = `${runner.firstName} ${runner.lastName}`;
            const krId = runner.kringId;
            return {
                id: lap.id.toString(),
                name,
                kringId: krId.toString(),
                kringName: kringNameMap[krId] || '',
                imageUrl: `/kringen/${kringNameMap[krId].replaceAll(' ', '')}.png`,
                time: lap.time || '0:00.00'
            };
        });

        const data: CompetitionData = {
            countdownTime,
            totalRuns,
            activeKrings,
            activeRunners,
            leaderboard,
            previousRunners
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
