import { useState } from 'react';
import { useFetch } from '../components/hooks';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { DownloadIcon } from '../components/Icons';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

function Synthese({ data }) {
  if (!data) return null;
  return (
    <div className="kpi-grid">
      <div className="kpi-card kpi-indigo">
        <div className="kpi-label">Équipements</div>
        <div className="kpi-value">{data.total}</div>
        <div className="kpi-sub">Total</div>
      </div>
      <div className="kpi-card kpi-success">
        <div className="kpi-label">En service (OK)</div>
        <div className="kpi-value">{data.enService}</div>
      </div>
      <div className="kpi-card kpi-danger">
        <div className="kpi-label">Hors service (NOK)</div>
        <div className="kpi-value">{data.horsService}</div>
      </div>
      <div className="kpi-card kpi-purple">
        <div className="kpi-label">% défaillance global</div>
        <div className="kpi-value">{data.tauxDefaillance}%</div>
      </div>
      <div className="kpi-card kpi-info">
        <div className="kpi-label">ECME</div>
        <div className="kpi-value">{data.totalEcme}</div>
      </div>
      <div className="kpi-card kpi-info">
        <div className="kpi-label">Interventions</div>
        <div className="kpi-value">{data.totalInterventions}</div>
      </div>
      <div className="kpi-card kpi-warning">
        <div className="kpi-label">Temps d'arrêt cumulé</div>
        <div className="kpi-value">{data.totalArret}h</div>
      </div>
    </div>
  );
}

function StatutParZone({ data }) {
  if (!data) return null;
  return (
    <div className="card">
      <h3 className="mb">Répartition OK / NOK par zone de production</h3>
      {data.parZone.map((z) => {
        const pct = z.total ? Math.round((z.ok / z.total) * 100) : 0;
        return (
          <div key={z.zone} className="zone-bar-row">
            <div className="zone-bar-name">{z.zone || 'Sans zone'}</div>
            <div className="zone-bar-track">
              <span className="zone-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="zone-bar-labels">
              <span className="zone-bar-ok">OK {z.ok}</span>
              <span className="zone-bar-nok">NOK {z.nok}</span>
            </div>
          </div>
        );
      })}
      {!data.parZone.length && <div className="empty">Aucune donnée</div>}
    </div>
  );
}

function Alertes({ data }) {
  if (!data) return null;
  return (
    <div className="card">
      <div className="flex-between mb">
        <h3>Alertes de contrôle (30 jours)</h3>
        <span className={`badge ${data.alertes.length ? 'badge-nok' : 'badge-ok'}`}>
          {data.alertes.length} alerte(s)
        </span>
      </div>
      {data.alertes.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Priorité</th>
                <th>Type</th>
                <th>Référence</th>
                <th>Libellé</th>
                <th>Date limite</th>
              </tr>
            </thead>
            <tbody>
              {data.alertes.map((a, i) => (
                <tr key={i}>
                  <td>
                    <span className={`badge ${a.statut === 'ECHUE' ? 'badge-nok' : 'badge-warn'}`}>
                      {a.statut === 'ECHUE' ? 'Critique' : '30 jours'}
                    </span>
                  </td>
                  <td>{a.type}</td>
                  <td className="mono">{a.ref}</td>
                  <td>{a.libelle}</td>
                  <td>{fmtDate(a.dateLimite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">Aucune alerte - tout est à jour</div>
      )}
    </div>
  );
}

function Historique() {
  const toast = useToast();
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [type, setType] = useState('TOUS');
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debut) params.set('debut', debut);
      if (fin) params.set('fin', fin);
      if (type && type !== 'TOUS') params.set('type', type);
      const res = await api.get(`/api/reporting/historique?${params}`);
      setRows(res);
      setLoaded(true);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    const params = new URLSearchParams();
    if (debut) params.set('debut', debut);
    if (fin) params.set('fin', fin);
    if (type && type !== 'TOUS') params.set('type', type);
    params.set('export', 'csv');
    window.open(`/api/reporting/historique?${params}`, '_blank');
  }

  return (
    <div className="card">
      <div className="flex-between mb">
        <h3>Rapport historique</h3>
        <button className="btn btn-secondary" onClick={exportCsv} disabled={!loaded}>
          <DownloadIcon size={15} /> Exporter CSV
        </button>
      </div>
      <div className="form-grid mb">
        <div className="field">
          <label>Date début</label>
          <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
        </div>
        <div className="field">
          <label>Date fin</label>
          <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
        </div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="TOUS">Tous</option>
            <option value="CHANGEMENT_STATUT">Changements de statut</option>
            <option value="INTERVENTION">Interventions de maintenance</option>
          </select>
        </div>
        <div className="field" style={{ alignSelf: 'end' }}>
          <button className="btn" onClick={load}>
            {loading ? 'Chargement...' : 'Générer'}
          </button>
        </div>
      </div>
      {loaded && (
        <DataTableSimple rows={rows} />
      )}
    </div>
  );
}

function DataTableSimple({ rows }) {
  const cols = rows.length ? Object.keys(rows[0]) : [];
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c}>
                  {c === 'Date' ? fmtDate(r[c]) : r[c]}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={cols.length || 1} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                Aucune donnée sur la période
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Reporting() {
  const { data, loading, error } = useFetch('/api/reporting/synthese');
  const [tab, setTab] = useState('synthese');

  return (
    <div>
      <div className="page-title">
        <h1>Reporting et rappels</h1>
        <p>Synthèse globale, répartition par zone, alertes de contrôle et historique</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'synthese' ? 'active' : ''}`} onClick={() => setTab('synthese')}>
          Synthèse globale
        </button>
        <button className={`tab ${tab === 'zones' ? 'active' : ''}`} onClick={() => setTab('zones')}>
          Statut par zone
        </button>
        <button className={`tab ${tab === 'alertes' ? 'active' : ''}`} onClick={() => setTab('alertes')}>
          Alertes
        </button>
        <button className={`tab ${tab === 'historique' ? 'active' : ''}`} onClick={() => setTab('historique')}>
          Historique
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && !data ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <>
          {tab === 'synthese' && <Synthese data={data} />}
          {tab === 'zones' && <StatutParZone data={data} />}
          {tab === 'alertes' && <Alertes data={data} />}
          {tab === 'historique' && <Historique />}
        </>
      )}
    </div>
  );
}