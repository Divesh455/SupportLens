import { useEffect, useState } from 'react';
import { Shield, UserPlus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage } from '../utils/formatters';
import { ROLE_LABELS, ROLES } from '../utils/constants';

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentForm, setAgentForm] = useState({ name: '', email: '', password: '', company: '' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await adminAPI.createAgent(agentForm);
      setAgentForm({ name: '', email: '', password: '', company: '' });
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-16 text-slate-500">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-600" />
          User & Agent Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage roles, support agents, and system access</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-brand-500" />
          Create Support Agent
        </h2>
        <form onSubmit={handleCreateAgent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['name', 'email', 'password', 'company'].map((field) => (
            <input
              key={field}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={agentForm[field]}
              onChange={(e) => setAgentForm({ ...agentForm, [field]: e.target.value })}
              required={field !== 'company'}
              className="input-field"
            />
          ))}
          <button type="submit" disabled={creating} className="btn-primary sm:col-span-2">
            {creating ? 'Creating…' : 'Create Agent'}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-800">All Users ({users.length})</h2>
        </div>
        {loading ? (
          <LoadingSpinner className="py-12" text="Loading users…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Email</th>
                  <th className="text-left px-6 py-3 font-medium">Role</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-6 py-3 text-slate-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      {u.role !== ROLES.ADMIN && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
