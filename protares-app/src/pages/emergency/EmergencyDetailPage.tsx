import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Ambulance, Phone, Video, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusStepper } from '@/components/emergency/StatusStepper';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';

export function EmergencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeEmergency = useEmergencyStore((s) => s.activeEmergency);
  const activeResponse = useEmergencyStore((s) => s.activeResponse);
  const setResponseStatus = useEmergencyStore((s) => s.setResponseStatus);

  // In production, fetch emergency by id. For now, use active emergency from store.
  const emergency = activeEmergency;

  if (!emergency) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Emergency" showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Emergency not found</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/app')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title={EMERGENCY_TYPE_LABELS[emergency.emergencyType] || 'Emergency'} showBack />

      {activeResponse && <StatusStepper currentStatus={activeResponse.status} />}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Severity Badge */}
        <div className="flex items-center justify-between">
          <Badge
            label={emergency.severity.toUpperCase()}
            variant={emergency.severity === 'critical' ? 'error' : emergency.severity === 'serious' ? 'warning' : 'info'}
          />
          <span className="text-gray-500 text-sm">ID: {emergency.id.slice(0, 8)}</span>
        </div>

        {/* Map Placeholder */}
        <Card variant="outlined" className="h-48 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin size={32} className="text-emergency-500 mx-auto mb-1" />
            <p className="text-gray-500 text-sm">Map View</p>
          </div>
        </Card>

        {/* Details */}
        <Card variant="outlined">
          <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
          <div className="space-y-3">
            <DetailRow icon={MapPin} label="Location" value={emergency.locationAddress || emergency.locationDescription || 'Location shared'} />
            {emergency.description && <DetailRow icon={AlertTriangle} label="Description" value={emergency.description} />}
            <DetailRow icon={Users} label="Casualties" value={`${emergency.casualtyCount} ${emergency.casualtyCount === 1 ? 'person' : 'people'}`} />
            {emergency.ambulanceEtaMinutes && (
              <DetailRow icon={Ambulance} label="Ambulance ETA" value={`${emergency.ambulanceEtaMinutes} minutes`} />
            )}
            <DetailRow icon={Clock} label="Reported" value={new Date(emergency.createdAt).toLocaleTimeString()} />
          </div>
        </Card>

        {/* Actions */}
        {activeResponse?.status === 'en_route' && (
          <Button variant="success" fullWidth size="lg" onClick={() => setResponseStatus('on_scene')}>
            I've Arrived On Scene
          </Button>
        )}
        {activeResponse?.status === 'on_scene' && (
          <Button variant="primary" fullWidth size="lg" onClick={() => navigate(`/app/emergency/${id}/handover`)}>
            Begin Handover
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" icon={Phone}>Call 999</Button>
          <Button variant="secondary" icon={Video}>Witness Video</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}
