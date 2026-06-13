import { useAuth } from '../hooks/useAuth';
import { User, Mail, Building, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 flex items-center gap-6 border-b border-gray-100">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
            <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <dl className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <dt className="w-48 text-sm font-medium text-gray-500 flex items-center gap-2 mb-1 sm:mb-0">
                <User size={18} />
                Full Name
              </dt>
              <dd className="text-gray-900 font-medium">{user.name}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <dt className="w-48 text-sm font-medium text-gray-500 flex items-center gap-2 mb-1 sm:mb-0">
                <Mail size={18} />
                Email Address
              </dt>
              <dd className="text-gray-900 font-medium">{user.email}</dd>
            </div>
            {user.company && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="w-48 text-sm font-medium text-gray-500 flex items-center gap-2 mb-1 sm:mb-0">
                  <Building size={18} />
                  Company
                </dt>
                <dd className="text-gray-900 font-medium">{user.company}</dd>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <dt className="w-48 text-sm font-medium text-gray-500 flex items-center gap-2 mb-1 sm:mb-0">
                <Shield size={18} />
                Account Role
              </dt>
              <dd className="text-gray-900 font-medium capitalize">{user.role}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <dt className="w-48 text-sm font-medium text-gray-500 flex items-center gap-2 mb-1 sm:mb-0">
                Joined
              </dt>
              <dd className="text-gray-900 font-medium">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
