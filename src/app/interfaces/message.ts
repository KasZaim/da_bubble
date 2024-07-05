export interface Reaction {
    count: number;
    users: string[];
}

export interface Message {
    id: string;
    avatar: string;
    name: string;
    time: string;
    message: string;
    createdAt: any;
    reactions?: { [key: string]: Reaction }; // Map<string, Reaction>
    padNumber: number | string;
    btnReactions: string[],
    imageUrl: string;
}

