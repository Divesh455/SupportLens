import { useState } from 'react';
import { X } from 'lucide-react';
import { TICKET_PRIORITIES } from '../utils/constants';
import ErrorAlert from './ErrorAlert';

export default function CreateTicketModal({ isOpen, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ issue: '', category: '', priority: 'Medium' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue.trim()) {
      setError('Please describe your issue.');
      return;
    }
    setError('');
    try {
      await onSubmit({
        issue: form.issue.trim(),
        category: form.category.trim() || undefined,
        priority: form.priority,
      });
      setForm({ issue: '', category: '', priority: 'Medium' });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Create Ticket</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Description</label>
            <textarea
              className="input-field min-h-[120px] resize-none"
              placeholder="Describe your support issue in detail…"
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Billing, Technical, Account"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
