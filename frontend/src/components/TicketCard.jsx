export default function TicketCard({ ticket, onStatusChange }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">{ticket.issue}</h3>
        </div>
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {ticket.summary && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.summary}</p>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Created: {new Date(ticket.created_at).toLocaleDateString()}
        </span>

        {onStatusChange && ticket.status !== 'Closed' && (
          <select
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1"
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        )}
      </div>
    </div>
  );
}
