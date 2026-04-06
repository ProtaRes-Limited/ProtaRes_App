import { Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth';

export function HistoryPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Response History</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.totalResponses || 0}</p>
            <p className="text-gray-500 text-xs">Total Alerts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{user?.totalAccepted || 0}</p>
            <p className="text-gray-500 text-xs">Accepted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">
              {user?.averageResponseTimeSeconds ? `${Math.round(user.averageResponseTimeSeconds / 60)}:${String(user.averageResponseTimeSeconds % 60).padStart(2, '0')}` : '--:--'}
            </p>
            <p className="text-gray-500 text-xs">Avg Time</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <EmptyState
          icon={Clock}
          title="No Responses Yet"
          description="Your emergency response history will appear here once you respond to your first alert."
        />
      </div>
    </div>
  );
}
