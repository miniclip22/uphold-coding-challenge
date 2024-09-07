// src/api/bot/stop/route.ts

import { NextResponse } from 'next/server';
import { stopMonitoring } from '@/app/api/bot/utils/helper';

export async function POST() {
    await stopMonitoring();
    return NextResponse.json({ message: 'Monitoring stopped' });
}
