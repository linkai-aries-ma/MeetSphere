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
    startDate: string; // Only relevant for regularity = 'once'
}

interface FillScheduleViewProps {
    nDays: number,
    startDate: string,
    regularity: string,
    availability?: number[][],

    mountPoint: string,
}

export enum Preference {
    high = 3,
    medium = 2,
    low = 1,
    none = 0,
}

declare function createLink(invitation: Invitation);
declare function emptyAvailability(days: number): Preference[][];
declare function shuffle(array: any[]): any[];
declare function fillScheduleView(props: FillScheduleViewProps): void;