import { NextRequest } from 'next/server';
import prisma from '@/prismaClient';
import { Alert } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
    const id: number = parseInt(params.id);

    if (isNaN(id)) {
        return new Response(JSON.stringify({ message: 'Invalid ID' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const alert = await prisma.alert.findUnique({
        where: {
            id: id,
        },
    }) as Alert | null;

    if (!alert) {
        return new Response(JSON.stringify({ message: 'Alert not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(alert), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
