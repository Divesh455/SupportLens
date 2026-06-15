import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-purple">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-cyan rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">SupportLens</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Support that<br />actually remembers
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            AI-powered customer support with persistent memory. Never make your customers repeat themselves again.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm">
            {[
              { label: 'Memory Recall', desc: 'Remembers past issues' },
              { label: 'AI Chat', desc: 'Instant smart responses' },
              { label: 'Ticket Tracking', desc: 'Full issue lifecycle' },
              { label: 'Sentiment AI', desc: 'Emotion-aware support' },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-white/70 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SupportLens</span>
          </div>
          <Outlet />
          <p className="text-center text-xs text-slate-400 mt-8">
            © 2026 SupportLens. AI Customer Support Platform.
          </p>
        </div>
      </div>
    </div>
  );
}
