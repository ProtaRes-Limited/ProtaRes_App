import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminSupabase } from '../lib/supabase';
import { MetricCard } from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface Metrics {
  totalResponders: number;
  activeNow: number;
  totalEmergencies: number;
  emergenciesToday: number;
  totalResponses: number;
  avgResponseTimeSec: number | null;
  pendingCredentials: number;
  openDataRequests: number;
}

interface DailyEmergency { date: string; count: number }
interface TierBreakdown { tier: string; count: number }

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyEmergency[]>([]);
  const [tierChart, setTierChart] = useState<TierBreakdown[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalResponders },
      { count: activeNow },
      { count: totalEmergencies },
      { count: emergenciesToday },
      { count: totalResponses },
      { data: avgData },
      { count: pendingCredentials },
      { count: openDataRequests },
      { data: emergenciesRaw },
      { data: respondersRaw },
    ] = await Promise.all([
      adminSupabase.from('responders').select('*', { count: 'exact', head: true }),
      adminSupabase.from('responders').select('*', { count: 'exact', head: true }).eq('availability', 'available'),
      adminSupabase.from('emergencies').select('*', { count: 'exact', head: true }),
      adminSupabase.from('emergencies').select('*', { count: 'exact', head: true }).gte('created_at', today),
      adminSupabase.from('responses').select('*', { count: 'exact', head: true }),
      adminSupabase.from('responses').select('response_time_seconds').not('response_time_seconds', 'is', null),
      adminSupabase.from('credentials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminSupabase.from('data_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminSupabase.from('emergencies').select('created_at,status').order('created_at', { ascending: false }).limit(50),
      adminSupabase.from('responders').select('tier'),
    ]);

    const times = (avgData ?? []) as { response_time_seconds: number }[];
    const avg = times.length ? times.reduce((s, r) => s + r.response_time_seconds, 0) / times.length : null;

    setMetrics({
      totalResponders: totalResponders ?? 0,
      activeNow: activeNow ?? 0,
      totalEmergencies: totalEmergencies ?? 0,
      emergenciesToday: emergenciesToday ?? 0,
      totalResponses: totalResponses ?? 0,
      avgResponseTimeSec: avg,
      pendingCredentials: pendingCredentials ?? 0,
      openDataRequests: openDataRequests ?? 0,
    });

    // Daily chart — last 14 days
    const grouped: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      grouped[d.toISOString().split('T')[0]] = 0;
    }
    (emergenciesRaw ?? []).forEach((e: Record<string, unknown>) => {
      const d = String(e.created_at).split('T')[0];
      if (d in grouped) grouped[d]++;
    });
    setDailyChart(Object.entries(grouped).map(([date, count]) => ({ date: date.slice(5), count })));

    // Tier breakdown
    const tiers: Record<string, number> = {};
    (respondersRaw ?? []).forEach((r: Record<string, unknown>) => {
      const t = String(r.tier ?? 'unknown');
      tiers[t] = (tiers[t] ?? 0) + 1;
    });
    setTierChart(Object.entries(tiers).map(([tier, count]) => ({
      tier: tier.replace('tier', 'T').replace('_', ' ').slice(0, 12),
      count,
    })));

    setRecentEmergencies((emergenciesRaw ?? []).slice(0, 8) as Record<string, unknown>[]);
    setLoading(false);
  }

  const fmtTime = (sec: number | null) =>
    sec == null ? '—' : sec < 60 ? `${Math.round(sec)}s` : `${Math.round(sec / 60)}m`;

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><span className="loading-spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--nhs-blue)' }}>Dashboard</h1>
        <p style={{ color: 'var(--grey3)', fontSize: 13, marginTop: 4 }}>
          Live overview of ProtaRes operations · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Total responders" value={metrics!.totalResponders} sub="Registered accounts" icon="👤" />
        <MetricCard label="Active now" value={metrics!.activeNow} sub="Available for dispatch" icon="🟢" color="var(--nhs-green)" />
        <MetricCard label="Emergencies today" value={metrics!.emergenciesToday} sub={`${metrics!.totalEmergencies} total`} icon="🚨" color="var(--nhs-red)" />
        <MetricCard label="Total responses" value={metrics!.totalResponses} sub="All time" icon="⚡" />
        <MetricCard label="Avg response time" value={fmtTime(metrics!.avgResponseTimeSec)} sub="Accepted responses" icon="⏱️" />
        <MetricCard label="Pending credentials" value={metrics!.pendingCredentials} sub="Awaiting review" icon="🛡️" color={metrics!.pendingCredentials > 0 ? 'var(--nhs-orange)' : 'var(--nhs-green)'} />
        <MetricCard label="Data requests" value={metrics!.openDataRequests} sub="GDPR pending" icon="📋" color={metrics!.openDataRequests > 0 ? 'var(--nhs-orange)' : 'var(--nhs-green)'} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Emergencies — last 14 days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#005EB8" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Responders by tier</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tierChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="tier" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#007F3B" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent emergencies */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent emergencies</h3>
          <Link to="/emergencies" style={{ fontSize: 13 }}>View all →</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {recentEmergencies.map(e => (
              <tr key={String(e.id)}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(e.id).slice(0, 8)}…</td>
                <td><StatusBadge status={String(e.status)} /></td>
                <td style={{ fontSize: 12, color: 'var(--grey3)' }}>{new Date(String(e.created_at)).toLocaleString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'badge-red', resolved: 'badge-green', dispatched: 'badge-blue',
    cancelled: 'badge-grey', pending: 'badge-yellow',
  };
  return <span className={`badge ${map[status] ?? 'badge-grey'}`}>{status}</span>;
}
