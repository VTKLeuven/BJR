import {NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'

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

async function getActiveLaps() {
    return prisma.lap.findMany({
        where: {
            time: 'null',
            competition: 5,
        },
        include: {runner: true}
    })
}


export async function GET() {
    try {
        const now = new Date();
        const currentTime = formatCurrentTime(now);

        // Fetch all runners with their laps
        const runners = await prisma.runner.findMany({ include: { laps: true } });
        // Finished = has at least one lap and no in-progress laps
        const finished = runners.filter(r => r.laps.some(l => l.time !== 'null'));

        const activeLaps = await getActiveLaps();


        // Gather unique kring IDs
        const kringIds = Array.from(new Set([
            ...finished.map(r => r.kringId),
            ...activeLaps.map(l => l.runner.kringId)
        ]));

        // Load kring names
        const krings = await prisma.kring.findMany({ where: { id: { in: kringIds } } });
        const kringById = Object.fromEntries(krings.map(k => [k.id, k.name]));

        // Compute stats for finished runners: best and last lap
        type RunnerStats = typeof finished[0] & { bestSeconds: number; lastSeconds: number };
        const finishedStats: RunnerStats[] = finished.map(r => {
            const validLaps = r.laps.filter(l => l.time !== 'null' && l.competition===5);

            // Skip runners with no valid laps
            if (validLaps.length === 0) {
                return { ...r, bestSeconds: Infinity, lastSeconds: Infinity };
            }

            const times = validLaps.map(l => parseLapTime(l.time));
            const bestSeconds = Math.min(...times);

            // Safe reduce with initial value
            const lastLap = validLaps.reduce((prev, curr) =>
                    new Date(prev.startTime) > new Date(curr.startTime) ? prev : curr
                , validLaps[0]);

            const lastSeconds = parseLapTime(lastLap.time);
            return { ...r, bestSeconds, lastSeconds };
        });

        // Filter out runners with no valid laps before sorting
        const sortedFinished = finishedStats
            .filter(r => r.bestSeconds !== Infinity)
            .sort((a, b) => a.bestSeconds - b.bestSeconds);

        // Top 10 finished runners
        const topRunners = sortedFinished.slice(0, 10).map(r => ({
            id:        r.id.toString(),
            name:      `${r.firstName} ${r.lastName}`,
            kringId:   r.kringId.toString(),
            kringName: kringById[r.kringId] || 'Unknown',
            imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
            time:      formatTime(r.bestSeconds),
            bestTime:  formatTime(r.bestSeconds)
        }));

        // All finished as previous, using last lap time for `time` and best lap for `bestTime`
        const previousRunners = sortedFinished.map(r => ({
            id:        r.id.toString(),
            name:      `${r.firstName} ${r.lastName}`,
            kringId:   r.kringId.toString(),
            kringName: kringById[r.kringId] || 'Unknown',
            imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
            time:      formatTime(r.lastSeconds),
            bestTime:  formatTime(r.bestSeconds)
        }));

        // Active runners: use startTime as currentTime, frontend will calculate elapsed
        const seen = new Set<number>();
        const activeRunners = activeLaps.flatMap(l => {
            const r = l.runner;
            if (seen.has(r.id)) return [];
            seen.add(r.id);
            return [{
                id:          r.id.toString(),
                name:        `${r.firstName} ${r.lastName}`,
                kringId:     r.kringId.toString(),
                kringName:   kringById[r.kringId] || 'Unknown',
                imageUrl: `/kringen/${kringById[r.kringId].replaceAll(' ', '')}.png`,
                currentTime: new Date(l.startTime).toISOString()
            }];
        });

        // Build and return API response
        const data = { currentTime, topRunners, activeRunners, previousRunners };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/individual-comp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
