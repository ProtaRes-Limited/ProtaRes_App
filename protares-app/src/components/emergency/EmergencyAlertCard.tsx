import { useEffect, useState } from 'react';
import { Heart, Car, Stethoscope, AlertTriangle, MapPin, Clock, Users, Ambulance } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Emergency, EmergencyType } from '@/types';
import { formatDistance, formatDuration } from '@/lib/utils';
import { ALERT_TIMEOUT_SECONDS } from '@/lib/constants';

interface EmergencyAlertCardProps {
  emergency: Emergency;
  etaSeconds: number;
  distanceMeters: number;
  corridorMatch?: string;
  onAccept: () => void;
  onDecline: () => void;
}

const emergencyIcons: Partial<Record<EmergencyType, typeof Heart>> = {
  cardiac_arrest: Heart,
  heart_attack: Heart,
  road_accident: Car,
  pedestrian_incident: Car,
  stroke: Stethoscope,
};

const emergencyLabels: Partial<Record<EmergencyType, string>> = {
  cardiac_arrest: 'CARDIAC ARREST',
  heart_attack: 'HEART ATTACK',
  road_accident: 'ROAD ACCIDENT',
  pedestrian_incident: 'PEDESTRIAN INCIDENT',
  stroke: 'STROKE',
  stabbing: 'STABBING',
};

export function EmergencyAlertCard({
  emergency,
  etaSeconds,
  distanceMeters,
  corridorMatch,
  onAccept,
  onDecline,
}: EmergencyAlertCardProps) {
  const [timeLeft, setTimeLeft] = useState(ALERT_TIMEOUT_SECONDS);
  const Icon = emergencyIcons[emergency.emergencyType] || AlertTriangle;
  const label = emergencyLabels[emergency.emergencyType] || 'EMERGENCY';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDecline]);

  return (
    <Card variant="emergency" className="mx-4 animate-emergency-pulse">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-emergency-500 flex items-center justify-center mr-4 flex-shrink-0">
          <Icon size={28} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-emergency-700 font-bold text-lg">{label}</h3>
          <p className="text-emergency-600 text-sm">
            {corridorMatch || `${formatDistance(distanceMeters)} away`}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <MapPin size={16} className="flex-shrink-0" />
          <span className="truncate">
            {emergency.locationAddress || emergency.locationDescription || 'Location shared'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock size={16} className="flex-shrink-0" />
          <span>ETA: {formatDuration(etaSeconds)}</span>
        </div>
        {emergency.casualtyCount > 0 && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Users size={16} className="flex-shrink-0" />
            <span>
              {emergency.casualtyCount} {emergency.casualtyCount === 1 ? 'casualty' : 'casualties'}
            </span>
          </div>
        )}
        {emergency.ambulanceEtaMinutes && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Ambulance size={16} className="flex-shrink-0" />
            <span>Ambulance ETA: {emergency.ambulanceEtaMinutes} mins</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onDecline} fullWidth>
          Decline
        </Button>
        <Button variant="emergency" onClick={onAccept} fullWidth>
          Accept
        </Button>
      </div>

      <div className="mt-3 text-center">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div
            className="bg-emergency-500 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / ALERT_TIMEOUT_SECONDS) * 100}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs">{timeLeft} seconds to respond</p>
      </div>
    </Card>
  );
}
