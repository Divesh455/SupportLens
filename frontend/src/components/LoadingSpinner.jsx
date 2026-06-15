import { Loader2 } from 'lucide-react';

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', text, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-brand-500 animate-spin`} />
      {text && <p className="text-sm text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
}
