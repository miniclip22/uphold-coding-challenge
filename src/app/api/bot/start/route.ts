// src/app/api/bot/start/route.ts
import { NextResponse } from 'next/server';
import { startMonitoring } from '@/app/api/bot/utils/helper';

let monitoringStarted = false;

export async function POST() {
    if (!monitoringStarted) {
        startMonitoring();
        monitoringStarted = true;
        console.log('Monitoring started');
        return NextResponse.json({ message: 'Monitoring started' });
    } else {
        return NextResponse.json({ message: 'Monitoring is already running.' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'GET request received' });
}
