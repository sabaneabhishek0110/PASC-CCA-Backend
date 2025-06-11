// services/eventService.ts

import { PrismaClient } from '@prisma/client';
import { EventInput, EventResponse } from '../types/event.types';

const prisma = new PrismaClient();

export const postEvent = async (eventData: EventInput): Promise<EventResponse> => {
    try {
        const currDate = new Date();
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);

        // Validate dates
        if (isNaN(startDate.getTime())) {
            return {
                success: false,
                message: "Invalid start date format",
                error: "START_DATE_INVALID"
            };
        }

        if (isNaN(endDate.getTime())) {
            return {
                success: false,
                message: "Invalid end date format",
                error: "END_DATE_INVALID"
            };
        }

        if (startDate > endDate) {
            return {
                success: false,
                message: "Event cannot end before it starts",
                error: "INVALID_DATE_RANGE"
            };
        }

        // Calculate status
        let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
        if (startDate <= currDate && endDate >= currDate) {
            status = 'ONGOING';
        } else if (endDate < currDate) {
            status = 'COMPLETED';
        }

        // Create event in database
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
            message: "Event created successfully",
            data: result
        };

    } catch (error) {
        console.error('Event creation failed:', error);
        return {
            success: false,
            message: "Failed to create event",
            error: error instanceof Error ? error.message : 'DATABASE_ERROR'
        };
    }
};