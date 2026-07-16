export default function SocialButtons() {
    return (
        <>
            <div className="space-y-3 mb-6">
                <button
                    type="button"
                    className="flex h-10 w-full items-center justify-center gap-3 px-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <div className="relative w-4 h-4">
                        <div className="absolute top-[2%] left-[2%] w-[46%] h-[46%] bg-[#f35325]" />
                        <div className="absolute top-[2%] right-[2%] w-[46%] h-[46%] bg-[#82bd01]" />
                        <div className="absolute bottom-[2%] left-[2%] w-[46%] h-[46%] bg-[#05a6f0]" />
                        <div className="absolute bottom-[2%] right-[2%] w-[46%] h-[46%] bg-[#ffba08]" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">Sign in with Microsoft Azure</span>
                </button>

                <button
                    type="button"
                    className="flex h-10 w-full items-center justify-center gap-3 px-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238499)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                    <span className="text-slate-700 font-medium text-sm">Sign in with Google</span>
                </button>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px bg-slate-100 flex-1" />
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
                <div className="h-px bg-slate-100 flex-1" />
            </div>
        </>
    )
}
