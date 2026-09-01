import { useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function Pinces() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/pinces"
      title="Pinces"
      subtitle="Référentiel des pinces"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'numero_pince', label: 'N° Pince', render: (r) => <span className="mono">{r.numero_pince}</span> },
        { key: 'designation', label: 'Désignation' },
      ]}
      fields={[
        { name: 'numero_pince', label: 'N° Pince *', placeholder: 'P-001' },
        { name: 'designation', label: 'Désignation' },
      ]}
    />
  );
}

function Mors() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/mors"
      title="Mors"
      subtitle="Référentiel des mors"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'designation', label: 'Désignation' },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *', placeholder: 'MORS-A' },
        { name: 'designation', label: 'Désignation' },
      ]}
    />
  );
}

function Positions() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/positions"
      title="Mors / Positions"
      subtitle="Configuration des positions des mors"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'mors', label: 'Mors', render: (r) => (r.mors ? r.mors.reference : '') },
        { key: 'position', label: 'Position', render: (r) => <span className="mono">{r.position}</span> },
      ]}
      fields={[
        {
          name: 'mors',
          label: 'Mors *',
          type: 'select',
          optionsSource: '/api/outillage/mors',
          optionLabelKey: 'reference',
        },
        { name: 'position', label: 'Position *', placeholder: 'P1' },
      ]}
    />
  );
}

function Cosses() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/cosses"
      title="Cosses"
      subtitle="Référentiel des cosses"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'designation', label: 'Désignation' },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *', placeholder: 'COSSE-1.0' },
        { name: 'designation', label: 'Désignation' },
      ]}
    />
  );
}

function Fils() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/fils"
      title="Fils"
      subtitle="Référentiel des fils"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'section', label: 'Section' },
        { key: 'couleur', label: 'Couleur' },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *', placeholder: 'FIL-0.75' },
        { name: 'section', label: 'Section', placeholder: '0.75 mm²' },
        { name: 'couleur', label: 'Couleur' },
      ]}
    />
  );
}

function CossesFils() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/outillage/cosses-fils"
      title="Configuration Cosse / Fil"
      subtitle="Associations autorisées cosse - fil"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'cosse', label: 'Cosse', render: (r) => (r.cosse ? r.cosse.reference : '') },
        { key: 'fil', label: 'Fil', render: (r) => (r.fil ? r.fil.reference : '') },
      ]}
      fields={[
        {
          name: 'cosse',
          label: 'Cosse *',
          type: 'select',
          optionsSource: '/api/outillage/cosses',
          optionLabelKey: 'reference',
        },
        {
          name: 'fil',
          label: 'Fil *',
          type: 'select',
          optionsSource: '/api/outillage/fils',
          optionLabelKey: 'reference',
        },
      ]}
    />
  );
}

function Configurations() {
  const { data, loading, reload, error } = useFetch('/api/outillage/configurations');
  const { data: pinces } = useFetch('/api/outillage/pinces');
  const { data: mors } = useFetch('/api/outillage/mors');
  const { data: cosses } = useFetch('/api/outillage/cosses');
  const { data: fils } = useFetch('/api/outillage/fils');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({ pince: '', mors: '', position: '', cosse: '', fil: '', tenue_traction_minimale: '' });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      pince: row.pince?._id || row.pince || '',
      mors: row.mors?._id || row.mors || '',
      position: row.position || '',
      cosse: row.cosse?._id || row.cosse || '',
      fil: row.fil?._id || row.fil || '',
      tenue_traction_minimale: row.tenue_traction_minimale,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      if (editing) await api.put(`/api/outillage/configurations/${editing._id}`, body);
      else await api.post('/api/outillage/configurations', body);
      toast(editing ? 'Configuration modifiée' : 'Configuration créée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette configuration ?')) return;
    try {
      await api.del(`/api/outillage/configurations/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'pince', label: 'Pince', render: (r) => (r.pince ? <span className="mono">{r.pince.numero_pince}</span> : '') },
    { key: 'mors', label: 'Mors', render: (r) => (r.mors ? r.mors.reference : '') },
    { key: 'position', label: 'Position', render: (r) => <span className="mono">{r.position}</span> },
    { key: 'cosse', label: 'Cosse', render: (r) => (r.cosse ? r.cosse.reference : '') },
    { key: 'fil', label: 'Fil', render: (r) => (r.fil ? r.fil.reference : '') },
    { key: 'tenue_traction_minimale', label: 'Tenue min (N)' },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex">
          {isMaint && (
            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>
              Modifier
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-danger-outline btn-sm" onClick={() => remove(r)}>
              Supprimer
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 style={{ color: 'var(--primary)' }}>Règles de sertissage</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Configurations Pince / Mors / Position / Cosse / Fil
          </span>
        </div>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            + Nouvelle configuration
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
        title={editing ? 'Modifier la configuration' : 'Nouvelle configuration'}
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
            <label>Pince *</label>
            <select value={form.pince || ''} onChange={set('pince')}>
              <option value="">-- Sélectionner --</option>
              {(pinces || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.numero_pince}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mors *</label>
            <select value={form.mors || ''} onChange={set('mors')}>
              <option value="">-- Sélectionner --</option>
              {(mors || []).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.reference}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Position *</label>
            <input value={form.position || ''} onChange={set('position')} placeholder="P1" />
          </div>
          <div className="field">
            <label>Cosse *</label>
            <select value={form.cosse || ''} onChange={set('cosse')}>
              <option value="">-- Sélectionner --</option>
              {(cosses || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.reference}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Fil *</label>
            <select value={form.fil || ''} onChange={set('fil')}>
              <option value="">-- Sélectionner --</option>
              {(fils || []).map((f) => (
                <option key={f._id} value={f._id}>
                  {f.reference}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tenue à la traction minimale (N)</label>
            <input type="number" step="any" value={form.tenue_traction_minimale ?? ''} onChange={set('tenue_traction_minimale')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function Outillage() {
  const [tab, setTab] = useState('pinces');
  const tabs = [
    { id: 'pinces', label: 'Pinces' },
    { id: 'mors', label: 'Mors' },
    { id: 'positions', label: 'Mors / Positions' },
    { id: 'cosses', label: 'Cosses' },
    { id: 'fils', label: 'Fils' },
    { id: 'cosses-fils', label: 'Cosse / Fil' },
    { id: 'configurations', label: 'Configurations' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Outillages spécifiques</h1>
        <p>Module dédié aux pinces et applicateurs - référentiels et règles de sertissage</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'pinces' && <Pinces />}
      {tab === 'mors' && <Mors />}
      {tab === 'positions' && <Positions />}
      {tab === 'cosses' && <Cosses />}
      {tab === 'fils' && <Fils />}
      {tab === 'cosses-fils' && <CossesFils />}
      {tab === 'configurations' && <Configurations />}
    </div>
  );
}
