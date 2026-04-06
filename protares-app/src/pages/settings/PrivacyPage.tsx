import { Header } from '@/components/layout/Header';
import { useSettingsStore } from '@/stores/settings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Download, Trash2 } from 'lucide-react';

export function PrivacyPage() {
  const { locationConsent, analyticsConsent, marketingConsent, setLocationConsent, setAnalyticsConsent, setMarketingConsent } =
    useSettingsStore();

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Privacy" showBack />

      <div className="p-4 space-y-6 overflow-y-auto">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Location</h2>
          <Card variant="outlined">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary-500" />
                <div>
                  <p className="font-medium text-gray-900">Location Tracking</p>
                  <p className="text-gray-500 text-xs">Only when "Available"</p>
                </div>
              </div>
              <ToggleSwitch checked={locationConsent} onChange={setLocationConsent} />
            </div>
            <p className="text-gray-400 text-xs mt-3">Location history is deleted after 24 hours</p>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Consent Preferences</h2>
          <div className="bg-white rounded-xl divide-y divide-gray-100">
            <ConsentRow label="Emergency Alerts" description="Required for service" checked disabled />
            <ConsentRow label="Analytics" description="Help improve ProtaRes" checked={analyticsConsent} onChange={setAnalyticsConsent} />
            <ConsentRow label="Marketing" description="Occasional updates" checked={marketingConsent} onChange={setMarketingConsent} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Data & Privacy</h2>
          <div className="space-y-2">
            <Button variant="secondary" fullWidth icon={Download}>Download My Data</Button>
            <Button variant="danger" fullWidth icon={Trash2}>Delete My Account</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary-500' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ConsentRow({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}
