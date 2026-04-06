import { MapPin, Navigation, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationStore } from '@/stores/location';

export function MapPage() {
  const currentLocation = useLocationStore((s) => s.currentLocation);

  return (
    <div className="flex-1 flex flex-col">
      {/* Map placeholder */}
      <div className="flex-1 bg-gray-200 relative flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Map View</p>
          <p className="text-gray-400 text-sm mt-1">
            {currentLocation
              ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : 'Location not available'}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Connect Google Maps API to enable interactive map
          </p>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
            <Layers size={20} className="text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
            <Navigation size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="p-4 bg-white border-t border-gray-200">
        <Card variant="outlined">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">No Active Emergencies</p>
              <p className="text-gray-500 text-sm">Nearby emergencies will appear on the map</p>
            </div>
            <Button variant="ghost" size="sm">Refresh</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
