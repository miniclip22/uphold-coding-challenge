import prisma from '@/prismaClient';


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
