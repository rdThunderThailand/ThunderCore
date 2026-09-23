export type LogStatus = 'Success' | 'Warning' | 'Critical';
export type LogCategory = 'Auth' | 'App' | 'Org' | 'Security';

export interface LogEntry {
    id: string;
    action: string;
    user: string;
    target: string;
    ip: string;
    timestamp: string;
    dateValue: number;
    status: LogStatus;
    category: LogCategory;
}
