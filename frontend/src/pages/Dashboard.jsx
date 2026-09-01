import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFetch } from '../components/hooks';

const moduleCards = [
  { to: '/inventaire', label: 'Inventaire', desc: 'Équipements, statut & zones', icon: 'inventory' },
  { to: '/maintenance', label: 'Maintenance', desc: 'Interventions & contrôles', icon: 'maintenance' },
  { to: '/ecme', label: 'ECME', desc: 'Étalons & vérifications', icon: 'ecme' },
  { to: '/outillage', label: 'Outillages', desc: 'Pinces, mors, cosses & fils', icon: 'tools' },
  { to: '/mesures', label: 'Mesures Qualité', desc: "Force d'extraction", icon: 'quality' },
  { to: '/methodes', label: 'Dossiers Méthodes', desc: 'Clients, produits & specs', icon: 'methods' },
  { to: '/workflow', label: 'Workflows', desc: 'Processus de fabrication', icon: 'workflow' },
  { to: '/reporting', label: 'Reporting', desc: 'Synthèses & rappels', icon: 'reporting' },
];

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR');
}

function StatIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const paths = {
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    warn: <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /></>,
    gauge: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M12 3a9 9 0 0 0-9 9" /><path d="m19 5-3.5 3.5" /><path d="M21 12h-3" /></>,
    clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 11h6M9 15h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    inventory: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
    maintenance: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z" /></>,
    quality: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    ecme: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
    tools: <><path d="m14.7 6.3 3-3a5 5 0 0 0-6.4 6.4L4 17l3 3 7.7-7.3a5 5 0 0 0 6.4-6.4l-3 3-3-3Z" /></>,
    methods: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 5.5V21" /><path d="M8 7h8M8 11h8" /></>,
    workflow: <><rect x="3" y="4" width="6" height="5" rx="1" /><rect x="15" y="4" width="6" height="5" rx="1" /><rect x="9" y="15" width="6" height="5" rx="1" /><path d="M9 6.5h6M18 9v3.5h-6v2.5" /></>,
    reporting: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function KpiCard({ tone, icon, label, value, sub }) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <span className="kpi-icon"><StatIcon name={icon} /></span>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

const CHART_COLORS = {
  ok: '#16a34a',
  nok: '#dc3d3d',
};

function ZoneTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="dot" style={{ background: p.fill }} />
          {p.dataKey === 'ok' ? 'OK' : 'NOK'}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useFetch('/api/reporting/synthese');

  return (
    <div>
      <div className="page-title">
        <h1>Tableau de bord</h1>
        <p>Synthèse globale de l'état de la production</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard tone="indigo" icon="box" label="Équipements" value={data.total} sub="Total inventaire" />
            <KpiCard
              tone="success"
              icon="check"
              label="En service"
              value={data.enService}
              sub={`${data.total ? Math.round((data.enService / data.total) * 100) : 0}% de la flotte`}
            />
            <KpiCard tone="danger" icon="warn" label="Hors service" value={data.horsService} sub="NOK" />
            <KpiCard tone="purple" icon="gauge" label="Taux de défaillance" value={`${data.tauxDefaillance}%`} sub="Global" />
            <KpiCard tone="info" icon="clipboard" label="Interventions" value={data.totalInterventions} sub="Journalisées" />
            <KpiCard tone="warning" icon="clock" label="Temps d'arrêt" value={`${data.totalArret}h`} sub="Cumulés" />
          </div>

          <div className="grid-2">
            <div className="card chart-card">
              <h3 className="mb">Disponibilité de la flotte</h3>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'En service', value: data.enService || 0 },
                        { name: 'Hors service', value: data.horsService || 0 },
                      ]}
                      dataKey="value"
                      innerRadius={68}
                      outerRadius={92}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={data.enService && data.horsService ? 3 : 0}
                      stroke="none"
                    >
                      <Cell fill={CHART_COLORS.ok} />
                      <Cell fill={CHART_COLORS.nok} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <div className="donut-value">
                    {data.total ? Math.round((data.enService / data.total) * 100) : 0}%
                  </div>
                  <div className="donut-caption">Disponibilité</div>
                </div>
              </div>
              <div className="donut-legend">
                <span><i className="legend-dot" style={{ background: CHART_COLORS.ok }} /> En service ({data.enService})</span>
                <span><i className="legend-dot" style={{ background: CHART_COLORS.nok }} /> Hors service ({data.horsService})</span>
              </div>
            </div>

            <div className="card">
              <h3 className="mb">Alertes &amp; rappels (30 jours)</h3>
              {data.alertes.length ? (
                <div className="alert-list">
                  {data.alertes.slice(0, 6).map((a, i) => (
                    <div key={i} className={`alert-item ${a.statut === 'ECHUE' ? 'alert-item-nok' : 'alert-item-warn'}`}>
                      <span className={`badge ${a.statut === 'ECHUE' ? 'badge-nok' : 'badge-warn'}`}>
                        {a.statut === 'ECHUE' ? 'ÉCHUE' : 'ÉCHÉANCE'}
                      </span>
                      <div className="alert-item-body">
                        <b>{a.ref}</b>
                        <div className="mut">{a.libelle}</div>
                      </div>
                      <div className="mut alert-item-date">{fmtDate(a.dateLimite)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">Aucune alerte</div>
              )}
              <Link to="/reporting" className="btn btn-secondary btn-sm mt">
                Voir le reporting complet
              </Link>
            </div>
          </div>

          <div className="card chart-card" style={{ marginTop: 14 }}>
            <h3 className="mb">Statut par zone</h3>
            {data.parZone.length ? (
              <ResponsiveContainer width="100%" height={Math.max(140, data.parZone.length * 56)}>
                <BarChart
                  data={data.parZone.map((z) => ({ zone: z.zone || 'Sans zone', ok: z.ok, nok: z.nok }))}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis
                    type="category"
                    dataKey="zone"
                    width={110}
                    tick={{ fontSize: 12.5, fill: 'var(--text)' }}
                  />
                  <Tooltip content={<ZoneTooltip />} cursor={{ fill: 'var(--hover)' }} />
                  <Bar dataKey="ok" stackId="s" fill={CHART_COLORS.ok} radius={[0, 0, 0, 0]} barSize={18} />
                  <Bar dataKey="nok" stackId="s" fill={CHART_COLORS.nok} radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty">Aucune donnée</div>
            )}
          </div>

          <div className="cards module-grid" style={{ marginTop: 14 }}>
            {moduleCards.map((m) => (
              <Link to={m.to} key={m.to} className="card module-card">
                <span className="module-icon"><StatIcon name={m.icon} /></span>
                <div className="module-label">{m.label}</div>
                <div className="card-sub">{m.desc}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}