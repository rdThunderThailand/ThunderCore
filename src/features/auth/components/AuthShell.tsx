import Image from "next/image"
import Link from "next/link"
import SocialButtons from "@/src/features/auth/components/SocialButtons"

const BOLT_IMAGE = "/auth/image-13.png"
const TECH_IMAGE = "/auth/image-32.png"
const BG_IMAGE = "/auth/main-surface-bg.png"

interface AuthShellProps {
    title: string
    subtitle: string
    brandName: string
    headerLink: { href: string; label: string }
    footer?: React.ReactNode
    children: React.ReactNode
}

export default function AuthShell({
    title,
    subtitle,
    brandName,
    headerLink,
    footer,
    children
}: AuthShellProps) {
    return (
        <div className="flex min-h-screen w-full relative">
            {/* Background Image for Left Column (or Whole Page on Mobile) */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Image src={BG_IMAGE} alt="Background" fill priority sizes="100vw" className="object-cover" />
            </div>

            {/* Left Column - Form */}
            <div className="flex flex-col w-full lg:w-[50%] relative p-6 lg:p-12 z-10">

                {/* Header row: Logo Left, Create Account Right */}
                <div className="flex items-center justify-between w-full mb-8 lg:mb-0 lg:absolute lg:top-8 lg:left-8 lg:right-8 lg:w-auto">
                    <div className="flex items-center gap-2">
                        <img src="/cityzen-logo.png" alt={brandName} className="w-5 h-5 object-contain" />
                        <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">{brandName}</span>
                    </div>

                    <Link
                        href={headerLink.href}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        {headerLink.label}
                    </Link>
                </div>

                {/* Centered Form Container */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-[400px] bg-white rounded-[24px] p-8 lg:p-10 shadow-xl shadow-blue-900/5">
                        {/* Header */}
                        <div className="flex flex-col items-center gap-6 mb-8">
                            <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <img src="/cityzen-logo.png" alt={brandName} className="w-8 h-8 object-contain" />
                            </div>
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                                <p className="text-xs text-center text-slate-500 max-w-[280px] leading-relaxed mx-auto">
                                    {subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <SocialButtons />

                        {children}

                        {footer}
                    </div>
                </div>
            </div>

            {/* Right Column - Dark Theme & Branding */}
            <div className="hidden lg:flex w-[50%] bg-[#000510] m-3 rounded-[32px] relative overflow-hidden flex-col justify-end p-16 z-20">

                {/* Background Image (Image 32) */}
                <div className="absolute inset-0 w-full h-full z-0">
                    <Image src={TECH_IMAGE} alt="Tech Background" fill priority sizes="50vw" className="object-cover opacity-50 bg-blend-luminosity" />
                    {/* Overlay gradient/tint for the blue dark theme */}
                    <div className="absolute inset-0 bg-[#000510]/80 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000510] to-transparent"></div>
                </div>

                {/* Foreground Bolt/Robot Image (Image 13) */}
                <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    <Image src={BOLT_IMAGE} alt="Thunder Bolt" fill priority sizes="50vw" className="object-cover" />
                </div>

                <div className="relative z-20">
                    <div className="flex items-center gap-3 mb-4 bg-white/20 p-4 rounded-2xl backdrop-blur-sm w-fit">
                        <img src="/cityzen-logo.png" alt="CityZen" className="w-8 h-8 object-contain" />
                        <span className="text-3xl font-bold tracking-tight text-white uppercase">CITYZEN</span>
                    </div>
                    <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
                        See every movement Measure every use with an Intelligent Dashboard.
                    </p>
                </div>
            </div>
        </div>
    )
}
