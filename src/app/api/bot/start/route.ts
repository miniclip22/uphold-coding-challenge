import {NextResponse} from 'next/server';
import {startMonitoring} from "@/app/api/bot/utils/helper";
import {monitoringState} from "@/app/api/bot/utils/monitoringState";

export async function POST() {
    if (!monitoringState.monitoringStarted) {
        await startMonitoring();
        monitoringState.monitoringStarted = true;
        console.log('Monitoring started');
        return NextResponse.json({message: 'Monitoring started'});
    } else {
        return new Response(
            JSON.stringify({message: 'Monitoring is already running.'}),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
