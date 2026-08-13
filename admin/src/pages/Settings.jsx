import { Settings as SettingsIcon, Globe, Volume2, Database, Palette } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'General',
    icon: Globe,
    settings: [
      {
        label: 'Station Name',
        description: 'The public name of your radio service',
        type: 'text',
        value: '90s Radio',
      },
      {
        label: 'Tagline',
        description: 'Shown below the station name',
        type: 'text',
        value: 'Nostalgia on Air',
      },
    ],
  },
  {
    title: 'Playback',
    icon: Volume2,
    settings: [
      {
        label: 'Default Volume',
        description: 'Initial volume level for new listeners',
        type: 'range',
        value: '80',
      },
      {
        label: 'Auto-play',
        description: 'Start playback automatically when a station is selected',
        type: 'toggle',
        value: true,
      },
      {
        label: 'Crossfade Duration',
        description: 'Seconds of overlap between tracks',
        type: 'text',
        value: '0',
      },
    ],
  },
  {
    title: 'Data',
    icon: Database,
    settings: [
      {
        label: 'Backend API URL',
        description: 'The base URL of the backend API server',
        type: 'text',
        value: 'http://127.0.0.1:5001/api',
      },
      {
        label: 'MongoDB Status',
        description: 'Current database connection status',
        type: 'status',
        value: 'Unknown',
      },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    settings: [
      {
        label: 'Theme',
        description: 'Visual theme for the public radio player',
        type: 'select',
        value: 'Dark',
        options: ['Dark', 'Light', 'Auto'],
      },
      {
        label: 'Accent Color',
        description: 'Primary brand color used in the UI',
        type: 'color',
        value: '#d48c36',
      },
    ],
  },
];

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Configure radio behavior, playback defaults, and integrations.
        </p>
      </div>

      {/* Setting groups */}
      {SETTING_GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="glass-card rounded-xl overflow-hidden">
            {/* Group header */}
            <div className="px-5 py-3.5 border-b border-surface-800/40 flex items-center gap-2.5">
              <Icon size={16} className="text-brand-400" />
              <h3 className="text-sm font-bold text-surface-200">{group.title}</h3>
            </div>

            {/* Settings */}
            <div className="divide-y divide-surface-800/30">
              {group.settings.map((setting) => (
                <div
                  key={setting.label}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-200">{setting.label}</p>
                    <p className="text-[11px] text-surface-500 mt-0.5">{setting.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        defaultValue={setting.value}
                        className="w-full sm:w-56 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/60 text-sm text-surface-200 outline-none focus:border-brand-500/40 transition-colors"
                        readOnly
                      />
                    )}
                    {setting.type === 'toggle' && (
                      <div
                        className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors ${
                          setting.value ? 'bg-brand-500' : 'bg-surface-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                            setting.value ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                          style={{
                            width: '18px',
                            height: '18px',
                            top: '1px',
                            transform: setting.value ? 'translateX(20px)' : 'translateX(2px)',
                          }}
                        />
                      </div>
                    )}
                    {setting.type === 'range' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue={setting.value}
                          className="w-32 accent-brand-500"
                          readOnly
                        />
                        <span className="text-xs text-surface-400 w-8 text-right">
                          {setting.value}%
                        </span>
                      </div>
                    )}
                    {setting.type === 'status' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {setting.value}
                      </span>
                    )}
                    {setting.type === 'select' && (
                      <select
                        defaultValue={setting.value}
                        className="px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/60 text-sm text-surface-200 outline-none"
                        disabled
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'color' && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border border-surface-700"
                          style={{ background: setting.value }}
                        />
                        <span className="text-xs text-surface-400 font-mono">{setting.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Save button (placeholder) */}
      <div className="flex justify-end pt-2">
        <button className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
