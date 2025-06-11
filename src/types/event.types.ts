import { Response } from 'express';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface EventInput {
    title: string;
    description: string;
    location: string;
    credits: number;
    numDays: number;
    startDate: string | Date;
    endDate: string | Date;  
}

export interface EventOutput extends Omit<EventInput, 'startDate' | 'endDate'> {
    id: number;  // Changed from string to number
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventResponse {
    success: boolean;
    message?: string;
    data?: EventOutput;
    error?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

type CreateEventResponse = Response<ApiResponse<EventOutput>>;