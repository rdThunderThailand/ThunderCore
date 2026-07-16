import {
  ArrowRight,
  Globe,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Thunder</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-violet-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-violet-600 transition-colors">Preview</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-900 hover:text-violet-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto text-center space-y-8 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            New: MFA & Tenants Support
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Build faster with <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-cyan-500">
              Enterprise Control.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The complete SaaS starter with Supabase Auth, MFA, Tenants, and a premium dashboard. Ship your next big idea in days, not months.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-2 group"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              Live Demo
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 max-w-7xl mx-auto py-24 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure by Default</h3>
              <p className="text-slate-500 leading-relaxed">
                Ready-to-use MFA, password recovery, and role-based access control powered by Supabase Auth.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Tenant First</h3>
              <p className="text-slate-500 leading-relaxed">
                Built-in multi-tenancy support. Invite team members and manage tenants with ease.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Vercel Optimized</h3>
              <p className="text-slate-500 leading-relaxed">
                Using Next.js App Router and Server Components for the best performance and SEO.
              </p>
            </div>
          </div>
        </section>

        {/* Preview/CTA */}
        <section id="preview" className="px-6 max-w-7xl mx-auto py-24">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Ready to launch your next project?
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Join 1,000+ developers building with Thunder. Get started today with our free tier.
              </p>
              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-flex px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 max-w-7xl mx-auto py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600" />
            <span className="font-bold text-slate-900">Thunder</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2026 Thunder Inc. Built with Next.js & Supabase.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}