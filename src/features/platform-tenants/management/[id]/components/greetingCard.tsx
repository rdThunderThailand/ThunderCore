import { User } from 'lucide-react';
import { cn } from '@/utils/cn';


//mock ชั่วคราว จ้ะ
const greetingData: CardGreetingProps = {
    recipient: 'คุณสมชาย',
    summary: 'วันนี้มีการแจ้งเตือนใหม่ 3 รายการ และสถานีวัดน้ำ 2 แห่งรายงานค่าผิดปกติ',
    timeOfDay: 'morning',
    avatarSrc: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&auto=format&fit=crop&q=60',
};

export type TimeOfDayKey = 'morning' | 'afternoon' | 'evening';

export interface CardGreetingProps {
    greeting?: string;
    recipient: string;
    summary: string;
    avatarSrc?: string;
    avatarAlt?: string;
    timeOfDay?: TimeOfDayKey;
    className?: string;
}

const timeOfDayConfig: Record<TimeOfDayKey, string> = {
    morning: 'สวัสดีตอนเช้าครับ',
    afternoon: 'สวัสดีตอนบ่ายครับ',
    evening: 'สวัสดีตอนเย็นครับ',
};

export const CardGreeting = ({
    greeting,
    recipient,
    summary,
    avatarSrc,
    avatarAlt = 'avatar',
    timeOfDay = 'morning',
    className,
    ...props
}: CardGreetingProps) => {
    const resolvedGreeting = greeting ?? timeOfDayConfig[timeOfDay];

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm",
                className
            )}
            {...props}
        >
            {avatarSrc ? (
                <img
                    src={avatarSrc}
                    alt={avatarAlt}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                />
            ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full shrink-0">
                    <User className="w-8 h-8 text-slate-400" />
                </div>
            )}

            <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-lg font-bold text-blue-800 truncate">
                    {resolvedGreeting} {recipient}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {summary}
                </p>
            </div>
        </div>
    );
};

export default function CardGreetingDemo(props: Partial<CardGreetingProps>) {
    return <CardGreeting {...greetingData} {...props} />;
}

