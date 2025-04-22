import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define 10 distinct colors for the groups
const groupColors = [
    "#FF5733", // Red-Orange
    "#33A8FF", // Blue
    "#33FF57", // Green
    "#FF33F5", // Magenta
    "#FFD700", // Gold
    "#9933FF", // Purple
    "#FF9933", // Orange
    "#33FFC1", // Turquoise
    "#FF3355", // Red
    "#66FF33"  // Lime
];

// Helper to format seconds to "M:SS.ms" format
function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const wholeSec = Math.floor(secs);
    const ms = Math.floor((secs - wholeSec) * 1000);
    return `${minutes}:${wholeSec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Helper to calculate countdown time
function calculateCountdownTime(): string {
    const now = new Date();
    const target = new Date(now);
    target.setHours(19, 0, 0, 0); // Today at 19:00

    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    const ms = Math.floor((diffMs % 1000) / 10);

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export async function GET() {
    try {
        // Fetch all groups
        const groups = await prisma.group.findMany();

        // Fetch all runners with their laps
        const allRunners = await prisma.runner.findMany({
            include: {
                laps: true
            }
        });

        // Fetch active laps (time is null)
        const activeLaps = await prisma.lap.findMany({
            where: { time: 'null' },
            include: { runner: true }
        });

        // Fetch completed laps (time is not null)
        const completedLaps = await prisma.lap.findMany({
            where: { time: { not: 'null' } },
            include: { runner: true },
            orderBy: { startTime: 'desc' }
        });

        // Calculate average lap time per group
        const groupTimes: Record<number, number[]> = {};

        completedLaps.forEach(lap => {
            const groupNumber = lap.runner.groupNumber;
            if (!groupNumber) return;

            // Parse lap time (assuming format "M:SS.ms")
            const lapTime = parseFloat(lap.time);
            if (isNaN(lapTime)) return;

            if (!groupTimes[groupNumber]) {
                groupTimes[groupNumber] = [];
            }
            groupTimes[groupNumber].push(lapTime);
        });

        // Calculate average lap time for each group
        const groupAverages = Object.entries(groupTimes).map(([groupNumber, times]) => {
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            return {
                groupNumber: parseInt(groupNumber),
                avgTime
            };
        });

        // Format the leaderboard data with colors
        const leaderboard = groups.map(group => {
            const groupData = groupAverages.find(g => g.groupNumber === group.groupNumber);
            const avgTime = groupData ? formatTime(groupData.avgTime) : "0:00.000";
            const colorIndex = (group.groupNumber - 1) % 10; // Assign color based on group number

            return {
                id: group.groupNumber.toString(),
                name: group.groupName,
                averageTime: avgTime,
                color: groupColors[colorIndex] // Add color property
            };
        }).sort((a, b) => {
            if (a.averageTime === "0:00.000") return 1;
            if (b.averageTime === "0:00.000") return -1;
            return a.averageTime.localeCompare(b.averageTime);
        });

        // Format active runners data with colors
        const activeRunners = activeLaps.map(lap => {
            const runner = lap.runner;
            const group = groups.find(g => g.groupNumber === runner.groupNumber);
            const colorIndex = ((runner.groupNumber || 1) - 1) % 10;

            return {
                id: runner.id.toString(),
                name: `${runner.firstName || ''} ${runner.lastName || ''}`.trim(),
                groupId: runner.groupNumber?.toString() || '',
                groupName: group?.groupName || `Group ${runner.groupNumber}`,
                color: groupColors[colorIndex], // Add color property
                currentTime: formatTime((new Date().getTime() - new Date(lap.startTime).getTime()) / 1000)
            };
        });

        // Format previous runners data with colors
        const previousRunners = completedLaps.map(lap => {
            const runner = lap.runner;
            const group = groups.find(g => g.groupNumber === runner.groupNumber);

            if (!runner || !group) return null;

            const colorIndex = (group.groupNumber - 1) % 10;

            return {
                id: runner.id.toString(),
                name: `${runner.firstName || ''} ${runner.lastName || ''}`.trim(),
                groupId: group.groupNumber.toString(),
                groupName: group.groupName,
                color: groupColors[colorIndex], // Add color property
                time: lap.time,
                bestTime: lap.time
            };
        }).filter(Boolean);

        return NextResponse.json({
            countdownTime: calculateCountdownTime(),
            leaderboard,
            activeRunners,
            previousRunners: previousRunners.slice(0, 20) // Limit to most recent 20
        });
    } catch (error) {
        console.error('Error in GET /api/groepencompetitie:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}