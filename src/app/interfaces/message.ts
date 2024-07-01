export interface Message {
    id: string;
    avatar: string;
    name: string;
    time: string;
    message: string;
    createdAt: any;
    reactions?: { [key: string]: number }; //Map<string, number>
    padNumber: number | string;
    btnReactions: string[];
}
