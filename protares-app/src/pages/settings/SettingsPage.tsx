import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Info, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useSettingsStore } from '@/stores/settings';

export function SettingsPage() {
  const navigate = useNavigate();
  const { soundEnabled, vibrationEnabled, setSoundEnabled, setVibrationEnabled } = useSettingsStore();

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Settings" showBack />

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Preferences</h2>
          <div className="bg-white rounded-xl divide-y divide-gray-100">
            <ToggleItem label="Sound" description="Play sound for alerts" checked={soundEnabled} onChange={setSoundEnabled} />
            <ToggleItem label="Vibration" description="Vibrate for alerts" checked={vibrationEnabled} onChange={setVibrationEnabled} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">More</h2>
          <div className="bg-white rounded-xl divide-y divide-gray-100">
            <NavItem icon={Bell} label="Notifications" onClick={() => navigate('/app/settings/notifications')} />
            <NavItem icon={Lock} label="Privacy" onClick={() => navigate('/app/settings/privacy')} />
            <NavItem icon={Info} label="About ProtaRes" onClick={() => {}} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function NavItem({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-gray-500" />
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
