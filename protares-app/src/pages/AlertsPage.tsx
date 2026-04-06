import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/utils';

export function AlertsPage() {
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  if (pendingAlerts.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Filter size={20} className="text-gray-500" />
          </button>
        </div>
        <EmptyState
          icon={Bell}
          title="No Active Alerts"
          description="When emergencies are reported near you, they'll appear here."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'active' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Active
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {pendingAlerts.map((emergency) => (
          <Card key={emergency.id} variant="outlined" clickable>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                {EMERGENCY_TYPE_LABELS[emergency.emergencyType] || 'Emergency'}
              </h3>
              <Badge
                label={emergency.severity}
                variant={emergency.severity === 'critical' ? 'error' : emergency.severity === 'serious' ? 'warning' : 'default'}
                size="sm"
              />
            </div>
            <p className="text-gray-500 text-sm">{emergency.locationAddress || 'Location shared'}</p>
            <p className="text-gray-400 text-xs mt-1">{formatTimeAgo(emergency.createdAt)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
