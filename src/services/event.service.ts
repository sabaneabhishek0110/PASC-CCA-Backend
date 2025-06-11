import { PrismaClient } from '@prisma/client';
import { EventInput, EventResponse } from '../types/event.types';

const prisma = new PrismaClient();

export const postEvent = async (eventData: EventInput): Promise<EventResponse> => {
    try {
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        const currentDate = new Date();

        if (isNaN(startDate.getTime())) {
            throw new Error('Invalid start date');
        }
        if (isNaN(endDate.getTime())) {
            throw new Error('Invalid end date');
        }
        if (startDate > endDate) {
            throw new Error('Start date cannot be after end date');
        }

        let status : 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
        if (startDate <= currentDate && endDate >= currentDate) {
            status = 'ONGOING';
        } else if (endDate < currentDate) {
            status = 'COMPLETED';
        }

        const result = await prisma.event.create({
            data: {
                ...eventData,
                status,
                startDate,
                endDate
            }
        });

        return {
            success: true,
            message: 'Event created successfully',
            data: result
        };

    } catch (error) {
        console.error('Service error:', error);
        return {
            success: false,
            message: 'Failed to create event',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};