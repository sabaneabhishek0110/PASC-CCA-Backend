export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface EventInput {
    title: string;
    description: string;
    location: string;
    credits: number;
    numDays: number;
    capacity:number;
    startDate: string | Date; 
    endDate: string | Date;
}

export interface EventData {
    id: number;
    title: string;
    description: string;
    location: string;
    credits: number;
    numDays: number;
    capacity:number;
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T|T[];
    error?: string;
}

export type EventResponse = ApiResponse<EventData>;
