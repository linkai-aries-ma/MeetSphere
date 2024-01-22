interface Invitation {
    id: string;
    title: string;
    description: string;
    location: string;
    creator: string;

    // Requirement for the meeting time
    regularity: 'once' | 'daily' | 'weekly';
    duration: number; // in minutes
    timezone: string;
    daysRequired?: number;
}

declare function createLink(invitation: Invitation);