interface Invitation {
    id: string;
    title: string;
    description: string;
    location: string;
    organizer: string;
    participant: string;

    // Requirement for the meeting time
    regularity: 'once' | 'daily' | 'weekly';
    duration: number; // in minutes
    timezone: string;
    daysRequired?: number;

    // Creator's availability
    availability: Preference[][]; // Every 15 minutes
    timeRange?: {
        from: Date;
        to: Date;
    }; // Only relevant for regularity = 'once'
}

export enum Preference {
    high = 3,
    medium = 2,
    low = 1,
    none = 0,
}

declare function createLink(invitation: Invitation);