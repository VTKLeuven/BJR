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

// New leaderboard entry type (fastest laps)
interface LeaderboardEntry {
    lapId: string;
    runnerId: string;
    runnerName: string;
    kringId: string;
    kringName: string;
    time: string; // M:SS.ms
}

interface CompetitionData {
    countdownTime: string;      // MM:SS.ms
    totalRuns: number;
    activeKrings: KringResponse[];
    activeRunners: { [kringId: string]: RunnerResponse[] };
    leaderboard: LeaderboardEntry[];  // top 5 fastest laps
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

// Format milliseconds into "M:SS.ms"
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

        // Fetch all laps for those kringen, including runner
        const allLaps = await prisma.lap.findMany({
            where: { runner: { kringId: { in: allowedKringIds } } },
            include: { runner: true }
        });

        // Total runs is simply the length of allLaps with valid time
        const validLaps = allLaps.filter(lap => lap.time && lap.time !== 'null');
        const totalRuns = validLaps.length;

        // Build mapping kringId -> kringName
        const kringNameMap: Record<number, string> = {};
        allowedKrings.forEach(k => { kringNameMap[k.id] = k.name; });

        // Build active kringen with average times
        const lapsByKring: Record<number, typeof validLaps> = {};
        validLaps.forEach(lap => {
            const kId = lap.runner.kringId;
            if (!lapsByKring[kId]) lapsByKring[kId] = [];
            lapsByKring[kId].push(lap);
        });

        const activeKrings: KringResponse[] = [];
        for (const kring of allowedKrings) {
            const laps = lapsByKring[kring.id] || [];
            if (!laps.length) continue;
            const totalMs = laps.reduce((sum, lap) => sum + parseTimeString(lap.time!), 0);
            const avgMs = totalMs / laps.length;
            activeKrings.push({
                id: kring.id.toString(),
                name: kring.name,
                logoUrl: `/kringen/${kring.name.replaceAll(' ', '')}.png`,
                averageTime: formatMsToTime(avgMs)
            });
        }

        // Leaderboard: select 5 fastest laps across allKRings
        const fastestLaps = [...validLaps]
            .sort((a, b) => parseTimeString(a.time!) - parseTimeString(b.time!))
            .slice(0, 5)
            .map(lap => ({
                lapId: lap.id.toString(),
                runnerId: lap.runner.id.toString(),
                runnerName: `${lap.runner.firstName} ${lap.runner.lastName}`,
                kringId: lap.runner.kringId.toString(),
                kringName: kringNameMap[lap.runner.kringId] || '',
                time: lap.time!
            } as LeaderboardEntry));

        // Active runners: runners with pending laps
        const pendingLaps = await prisma.lap.findMany({
            where: {
                runner: { kringId: { in: allowedKringIds } },
                time: 'null'
            }
        });
        const uniqueRunnerIds = Array.from(new Set(pendingLaps.map(l => l.runnerId)));
        const pendingRunners = await prisma.runner.findMany({ where: { id: { in: uniqueRunnerIds } } });
        const activeRunners: Record<string, RunnerResponse[]> = {};
        pendingRunners.forEach(runner => {
            const krId = runner.kringId;
            const name = `${runner.firstName} ${runner.lastName}`;
            const resp: RunnerResponse = {
                id: runner.id.toString(),
                name,
                kringId: krId.toString(),
                kringName: kringNameMap[krId] || '',
                imageUrl: `/kringen/${kringNameMap[krId].replaceAll(' ', '')}.png`,
                time: '0:00.00'
            };
            if (!activeRunners[krId]) activeRunners[krId] = [];
            activeRunners[krId].push(resp);
        });

        // Previous runners: last 5 completed laps
        const recentLaps = await prisma.lap.findMany({
            where: { runner: { kringId: { in: allowedKringIds } } },
            orderBy: { startTime: 'desc' },
            take: 5,
            include: { runner: true }
        });
        const previousRunners: RunnerResponse[] = recentLaps
            .filter(lap => lap.time && lap.time !== 'null')
            .map(lap => ({
                id: lap.id.toString(),
                name: `${lap.runner.firstName} ${lap.runner.lastName}`,
                kringId: lap.runner.kringId.toString(),
                kringName: kringNameMap[lap.runner.kringId] || '',
                imageUrl: `/kringen/${kringNameMap[lap.runner.kringId]?.replaceAll(' ', '')}.png`,
                time: lap.time!
            }));

        const data: CompetitionData = {
            countdownTime,
            totalRuns,
            activeKrings,
            activeRunners,
            leaderboard: fastestLaps,
            previousRunners
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}