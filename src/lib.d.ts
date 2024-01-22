interface Invitation {
    id: string;
    title: string;
    description: string;
    creator: string;

    // Requirement for the meeting time
    regularity: 'once' | 'daily' | 'weekly';
    duration: number;
    timezone: string;
    daysRequired?: number;
}

declare function createLink(invitation: Invitation);