import {NextRequest} from 'next/server';
import prisma from '@/prismaClient';
import { Alert } from '@prisma/client';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return new Response(JSON.stringify({message: 'Invalid ID'}), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const body = await request.json();
        const {pair, rateChange, timestamp} = body;

        if (!pair || !rateChange || !timestamp) {
            return new Response(JSON.stringify({message: 'Missing fields in request body'}), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Update the alert using Prisma with type assertion
        const updatedAlert = await prisma.alert.update({
            where: {id},
            data: {
                pair,
                rateChange,
                timestamp: new Date(timestamp), // Assuming timestamp is sent as a string
            },
        }) as Alert;  // Type assertion to tell TypeScript this is an Alert

        return new Response(JSON.stringify(updatedAlert), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Failed to update alert:', error);
        return new Response(JSON.stringify({message: 'Failed to update alert'}), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}


export async function GET(): Promise<Response> {
    try {
        // Fetch all alerts from the database
        const alerts = await prisma.alert.findMany();

        // Return the alerts as a JSON response
        return new Response(JSON.stringify(alerts), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching alerts:', error);
        return new Response(
            JSON.stringify({ message: 'Error fetching alerts' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
