import { useMemo, useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { PencilIcon, TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

const TYPE_LABEL = {
  PREVENTIVE: 'Préventive',
  CORRECTIVE: 'Corrective',
  CONTROLE_PERIODIQUE: 'Contrôle périodique',
};
const FREQ_LABEL = {
  MENSUELLE: 'Mensuelle',
  TRIMESTRIELLE: 'Trimestrielle',
  SEMESTRIELLE: 'Semestrielle',
  ANNUELLE: 'Annuelle',
};

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

function Taches() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/maintenance/taches"
      title="Tâches de maintenance"
      subtitle="Tâches à effectuer par catégorie de machine et leur fréquence"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'categorie', label: 'Catégorie', render: (r) => (r.categorie ? r.categorie.nom : '') },
        { key: 'description', label: 'Description' },
        { key: 'frequence', label: 'Fréquence', render: (r) => FREQ_LABEL[r.frequence] || r.frequence },
        { key: 'temps_estime', label: 'Temps estimé (h)' },
      ]}
      fields={[
        {
          name: 'categorie',
          label: 'Catégorie',
          type: 'select',
          optionsSource: '/api/inventaire/categories',
          optionLabelKey: 'nom',
        },
        { name: 'description', label: 'Description', full: true },
        {
          name: 'frequence',
          label: 'Fréquence',
          type: 'select',
          options: Object.entries(FREQ_LABEL).map(([value, label]) => ({ value, label })),
        },
        { name: 'temps_estime', label: 'Temps estimé (h)', type: 'number' },
      ]}
    />
  );
}

function Interventions() {
  const { data, loading, reload, error } = useFetch('/api/maintenance/interventions');
  const { data: equipements } = useFetch('/api/inventaire/equipements');
  const { data: taches } = useFetch('/api/maintenance/taches');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({
      equipement: '',
      numero: '',
      type_intervention: 'PREVENTIVE',
      tache: '',
      date: '',
      temps_reel: '',
      technicien: user?.username || '',
      remarque: '',
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      equipement: row.equipement?._id || row.equipement || '',
      numero: row.numero || '',
      type_intervention: row.type_intervention,
      tache: row.tache?._id || row.tache || '',
      date: row.date ? row.date.slice(0, 10) : '',
      temps_reel: row.temps_reel,
      technicien: row.technicien || '',
      remarque: row.remarque || '',
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.tache) delete body.tache;
      if (body.date) delete body.date;
      if (editing) await api.put(`/api/maintenance/interventions/${editing._id}`, body);
      else await api.post('/api/maintenance/interventions', body);
      toast(editing ? 'Intervention modifiée' : 'Intervention enregistrée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette intervention ?')) return;
    try {
      await api.del(`/api/maintenance/interventions/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'numero', label: 'N°', render: (r) => <span className="mono">{r.numero || '—'}</span> },
    { key: 'equipement', label: 'Équipement', render: (r) => (r.equipement ? `${r.equipement.code_rai} - ${r.equipement.designation}` : '') },
    {
      key: 'type_intervention',
      label: 'Type',
      render: (r) => (
        <span className={`badge ${r.type_intervention === 'CORRECTIVE' ? 'badge-nok' : r.type_intervention === 'PREVENTIVE' ? 'badge-info' : 'badge-warn'}`}>
          {TYPE_LABEL[r.type_intervention]}
        </span>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
    { key: 'temps_reel', label: 'Temps réel (h)' },
    { key: 'technicien', label: 'Technicien' },
    { key: 'remarque', label: 'Remarque' },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="row-actions">
          {isMaint && (
            <button className="icon-btn icon-btn-edit" onClick={() => openEdit(r)} title="Modifier" aria-label="Modifier">
              <PencilIcon size={15} />
            </button>
          )}
          {isAdmin && (
            <button className="icon-btn icon-btn-danger" onClick={() => remove(r)} title="Supprimer" aria-label="Supprimer">
              <TrashIcon size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ color: 'var(--primary)' }}>Interventions</h2>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            <PlusIcon size={15} /> Nouvelle intervention
          </button>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Modifier l\u2019intervention' : 'Nouvelle intervention'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className="btn" onClick={save}>
              Enregistrer
            </button>
          </>
        }
      >
        <form onSubmit={save} className="form-grid">
          <div className="field">
            <label>Équipement *</label>
            <select value={form.equipement || ''} onChange={set('equipement')}>
              <option value="">-- Sélectionner --</option>
              {(equipements || []).map((e) => (
                <option key={e._id} value={e._id}>
                  {e.code_rai} - {e.designation}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>N° d'intervention</label>
            <input value={form.numero || ''} onChange={set('numero')} placeholder="INT-2026-XXX" />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={form.type_intervention || ''} onChange={set('type_intervention')}>
              {Object.entries(TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tâche associée</label>
            <select value={form.tache || ''} onChange={set('tache')}>
              <option value="">-- Aucune --</option>
              {(taches || []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.description}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date || ''} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Temps réel (h)</label>
            <input type="number" step="any" value={form.temps_reel ?? ''} onChange={set('temps_reel')} />
          </div>
          <div className="field">
            <label>Technicien</label>
            <input value={form.technicien || ''} onChange={set('technicien')} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Remarque</label>
            <textarea value={form.remarque || ''} onChange={set('remarque')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TempsArret() {
  const { data, loading, reload, error } = useFetch('/api/maintenance/temps-arret');
  const { data: equipements } = useFetch('/api/inventaire/equipements');
  const { data: zones } = useFetch('/api/inventaire/zones');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({
      technicien: user?.username || '',
      zone: '',
      equipement: '',
      semaine: '',
      date: '',
      heure_demande: '',
      heure_debut: '',
      heure_fin: '',
      description: '',
      temps_arret: '',
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      technicien: row.technicien || '',
      zone: row.zone?._id || row.zone || '',
      equipement: row.equipement?._id || row.equipement || '',
      semaine: row.semaine || '',
      date: row.date ? row.date.slice(0, 10) : '',
      heure_demande: row.heure_demande || '',
      heure_debut: row.heure_debut || '',
      heure_fin: row.heure_fin || '',
      description: row.description || '',
      temps_arret: row.temps_arret,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.zone) delete body.zone;
      if (!body.equipement) delete body.equipement;
      if (editing) await api.put(`/api/maintenance/temps-arret/${editing._id}`, body);
      else await api.post('/api/maintenance/temps-arret', body);
      toast(editing ? 'Temps d\u2019arrêt modifié' : 'Temps d\u2019arrêt enregistré');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cet enregistrement ?')) return;
    try {
      await api.del(`/api/maintenance/temps-arret/${row._id}`);
      toast('Supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'semaine', label: 'Semaine', render: (r) => <span className="mono">{r.semaine || '—'}</span> },
    { key: 'zone', label: 'Zone', render: (r) => (r.zone ? r.zone.nom_zone : '') },
    { key: 'equipement', label: 'Équipement', render: (r) => (r.equipement ? r.equipement.code_rai : '') },
    { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
    { key: 'heure_demande', label: 'Demande' },
    { key: 'heure_debut', label: 'Début' },
    { key: 'heure_fin', label: 'Fin' },
    { key: 'temps_arret', label: 'Arrêt (h)', render: (r) => <b>{r.temps_arret}h</b> },
    { key: 'description', label: 'Description' },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="row-actions">
          {isMaint && (
            <button className="icon-btn icon-btn-edit" onClick={() => openEdit(r)} title="Modifier" aria-label="Modifier">
              <PencilIcon size={15} />
            </button>
          )}
          {isAdmin && (
            <button className="icon-btn icon-btn-danger" onClick={() => remove(r)} title="Supprimer" aria-label="Supprimer">
              <TrashIcon size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ color: 'var(--primary)' }}>Suivi des temps d\u2019arrêt</h2>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            <PlusIcon size={15} /> Nouveau
          </button>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Modifier le temps d\u2019arrêt' : 'Nouveau temps d\u2019arrêt'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className="btn" onClick={save}>
              Enregistrer
            </button>
          </>
        }
      >
        <form onSubmit={save} className="form-grid">
          <div className="field">
            <label>Technicien</label>
            <input value={form.technicien || ''} onChange={set('technicien')} />
          </div>
          <div className="field">
            <label>Zone</label>
            <select value={form.zone || ''} onChange={set('zone')}>
              <option value="">-- Sélectionner --</option>
              {(zones || []).map((z) => (
                <option key={z._id} value={z._id}>
                  {z.nom_zone}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Équipement</label>
            <select value={form.equipement || ''} onChange={set('equipement')}>
              <option value="">-- Sélectionner --</option>
              {(equipements || []).map((e) => (
                <option key={e._id} value={e._id}>
                  {e.code_rai}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Semaine</label>
            <input value={form.semaine || ''} onChange={set('semaine')} placeholder="S31-2026" />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date || ''} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Heure demande</label>
            <input type="time" value={form.heure_demande || ''} onChange={set('heure_demande')} />
          </div>
          <div className="field">
            <label>Heure début</label>
            <input type="time" value={form.heure_debut || ''} onChange={set('heure_debut')} />
          </div>
          <div className="field">
            <label>Heure fin</label>
            <input type="time" value={form.heure_fin || ''} onChange={set('heure_fin')} />
          </div>
          <div className="field">
            <label>Temps d'arrêt (h)</label>
            <input type="number" step="any" value={form.temps_arret ?? ''} onChange={set('temps_arret')} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea value={form.description || ''} onChange={set('description')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function Calendrier() {
  const { data, loading, error } = useFetch('/api/maintenance/calendrier');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = first.getDay(); // 0=dim
    const nb = new Date(year, month + 1, 0).getDate();
    const list = [];
    for (let i = 0; i < startDow; i++) list.push(null);
    for (let d = 1; d <= nb; d++) list.push(new Date(year, month, d));
    return list;
  }, [month, year]);

  const eventsByDay = useMemo(() => {
    const map = {};
    (data || []).forEach((ev) => {
      const key = new Date(ev.start).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [data]);

  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <div>
      <div className="flex-between mb">
        <h2 style={{ color: 'var(--primary)' }}>Calendrier des interventions</h2>
        <div className="flex">
          <button className="icon-btn" onClick={prev} aria-label="Mois précédent">
            <ChevronLeftIcon size={16} />
          </button>
          <b style={{ minWidth: 130, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </b>
          <button className="icon-btn" onClick={next} aria-label="Mois suivant">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(days.length / 7) }).map((_, w) => (
                <tr key={w}>
                  {days.slice(w * 7, w * 7 + 7).map((d, i) => {
                    if (!d)
                      return (
                        <td key={i} style={{ background: 'var(--bg-subtle)' }} />
                      );
                    const events = eventsByDay[d.toDateString()] || [];
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <td key={i} style={{ verticalAlign: 'top', minHeight: 70, whiteSpace: 'normal' }}>
                        <b style={isToday ? { color: 'var(--accent)' } : undefined}>{d.getDate()}</b>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                          {events.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className={`badge ${ev.type === 'CORRECTIVE' ? 'badge-nok' : ev.type === 'PREVENTIVE' ? 'badge-info' : 'badge-warn'}`}
                              title={`${ev.title}${ev.zone ? ' - ' + ev.zone : ''}`}
                              style={{ fontSize: 10, justifyContent: 'flex-start', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {ev.equipement ? ev.equipement.code_rai : '—'}
                            </div>
                          ))}
                          {events.length > 3 && (
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{events.length - 3}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Maintenance() {
  const [tab, setTab] = useState('taches');
  const tabs = [
    { id: 'taches', label: 'Tâches' },
    { id: 'interventions', label: 'Interventions' },
    { id: 'arrets', label: 'Temps d\u2019arrêt' },
    { id: 'calendrier', label: 'Calendrier' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Gestion de la Maintenance</h1>
        <p>Journalisation des interventions et planification des contrôles périodiques</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'taches' && <Taches />}
      {tab === 'interventions' && <Interventions />}
      {tab === 'arrets' && <TempsArret />}
      {tab === 'calendrier' && <Calendrier />}
    </div>
  );
}