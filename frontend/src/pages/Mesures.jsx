import { useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

export default function Mesures() {
  const { data, loading, reload, error } = useFetch('/api/mesures/mesures');
  const { data: pinces } = useFetch('/api/outillage/pinces');
  const { data: configurations } = useFetch('/api/outillage/configurations');
  const { user } = useAuth();
  const toast = useToast();
  const canWrite = ['maintenance', 'admin', 'operateur'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, setValue, reset } = useForm({});

  function openCreate() {
    reset({
      date_mesure: '',
      pince: '',
      mors: '',
      morsLabel: '',
      position: '',
      cosse: '',
      cosseLabel: '',
      fil: '',
      filLabel: '',
      tenue_traction_minimale: '',
      v1: '',
      v2: '',
      v3: '',
      v4: '',
      v5: '',
      v6: '',
      prochaine_date: '',
      remarque: '',
    });
    setEditing(null);
    setOpen(true);
  }

  function onPinceChange(value) {
    const config = (configurations || []).find(
      (c) => String(c.pince && c.pince._id) === String(value)
    );
    setValue('pince', value);
    if (config) {
      setValue('mors', config.mors?._id || '');
      setValue('morsLabel', config.mors ? config.mors.reference : '');
      setValue('position', config.position || '');
      setValue('cosse', config.cosse?._id || '');
      setValue('cosseLabel', config.cosse ? config.cosse.reference : '');
      setValue('fil', config.fil?._id || '');
      setValue('filLabel', config.fil ? config.fil.reference : '');
      setValue('tenue_traction_minimale', config.tenue_traction_minimale || '');
    } else {
      setValue('morsLabel', '');
      setValue('cosseLabel', '');
      setValue('filLabel', '');
    }
  }

  function openEdit(row) {
    const vals = row.valeurs || [];
    reset({
      date_mesure: row.date_mesure ? row.date_mesure.slice(0, 10) : '',
      pince: row.pince?._id || row.pince || '',
      mors: row.mors?._id || row.mors || '',
      morsLabel: row.mors ? (row.mors.reference || '') : '',
      position: row.position || '',
      cosse: row.cosse?._id || row.cosse || '',
      cosseLabel: row.cosse ? (row.cosse.reference || '') : '',
      fil: row.fil?._id || row.fil || '',
      filLabel: row.fil ? (row.fil.reference || '') : '',
      tenue_traction_minimale: row.tenue_traction_minimale || '',
      v1: vals[0] ?? '',
      v2: vals[1] ?? '',
      v3: vals[2] ?? '',
      v4: vals[3] ?? '',
      v5: vals[4] ?? '',
      v6: vals[5] ?? '',
      prochaine_date: row.prochaine_date ? row.prochaine_date.slice(0, 10) : '',
      remarque: row.remarque || '',
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = {
        date_mesure: form.date_mesure || undefined,
        pince: form.pince,
        mors: form.mors || undefined,
        position: form.position || undefined,
        cosse: form.cosse || undefined,
        fil: form.fil || undefined,
        tenue_traction_minimale: form.tenue_traction_minimale || undefined,
        valeurs: [form.v1, form.v2, form.v3, form.v4, form.v5, form.v6].filter((v) => v !== ''),
        prochaine_date: form.prochaine_date || undefined,
        remarque: form.remarque || undefined,
      };
      if (editing) await api.put(`/api/mesures/mesures/${editing._id}`, body);
      else await api.post('/api/mesures/mesures', body);
      toast(editing ? 'Mesure modifiée' : 'Mesure enregistrée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette mesure ?')) return;
    try {
      await api.del(`/api/mesures/mesures/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'date_mesure', label: 'Date', render: (r) => fmtDate(r.date_mesure) },
    { key: 'pince', label: 'Pince', render: (r) => (r.pince ? <span className="mono">{r.pince.numero_pince}</span> : '') },
    { key: 'mors', label: 'Mors', render: (r) => (r.mors ? r.mors.reference : '') },
    { key: 'position', label: 'Position', render: (r) => <span className="mono">{r.position}</span> },
    { key: 'cosse', label: 'Cosse', render: (r) => (r.cosse ? r.cosse.reference : '') },
    { key: 'fil', label: 'Fil', render: (r) => (r.fil ? r.fil.reference : '') },
    { key: 'tenue_traction_minimale', label: 'Tenue min (N)' },
    { key: 'valeurs', label: 'Valeurs (N)', render: (r) => (r.valeurs || []).join(' / ') },
    { key: 'moyenne', label: 'Moyenne', render: (r) => {
        const v = (r.valeurs || []).filter((x) => x != null);
        if (!v.length) return '';
        return (v.reduce((s, x) => s + Number(x), 0) / v.length).toFixed(1);
      } },
    { key: 'statut', label: 'Statut', render: (r) => (
        <span className={`badge ${r.statut === 'CONFORME' ? 'badge-ok' : 'badge-nok'}`}>
          {r.statut === 'CONFORME' ? 'Conforme' : 'Non conforme'}
        </span>
      ) },
    { key: 'prochaine_date', label: 'Prochaine', render: (r) => fmtDate(r.prochaine_date) },
    { key: 'operateur', label: 'Opérateur' },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="row-actions">
          {canWrite && (
            <button className="icon-btn icon-btn-edit" onClick={() => openEdit(r)} title="Modifier" aria-label="Modifier">
              <PencilIcon size={15} />
            </button>
          )}
          {canDelete && (
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
      <div className="page-title">
        <h1>Mesures de contrôle qualité</h1>
        <p>Journal des mesures de force d'extraction des pinces</p>
      </div>
      <div className="toolbar">
        <h2 style={{ color: 'var(--primary)' }}>Journal des mesures</h2>
        {canWrite && (
          <button className="btn" onClick={openCreate}>
            <PlusIcon size={15} /> Nouvelle mesure
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
        <DataTable columns={columns} data={data || []} pageSize={12} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Modifier la mesure' : 'Nouvelle mesure de force d\u2019extraction'}
        size="lg"
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
            <label>Date de mesure</label>
            <input type="date" value={form.date_mesure || ''} onChange={set('date_mesure')} />
          </div>
          <div className="field">
            <label>Pince *</label>
            <select value={form.pince || ''} onChange={(e) => onPinceChange(e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {(pinces || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.numero_pince}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mors</label>
            <input value={form.morsLabel || ''} disabled />
          </div>
          <div className="field">
            <label>Position</label>
            <input value={form.position || ''} disabled />
          </div>
          <div className="field">
            <label>Cosse</label>
            <input value={form.cosseLabel || ''} disabled />
          </div>
          <div className="field">
            <label>Fil</label>
            <input value={form.filLabel || ''} disabled />
          </div>
          <div className="field">
            <label>Tenue à la traction minimale (N)</label>
            <input type="number" step="any" value={form.tenue_traction_minimale ?? ''} onChange={set('tenue_traction_minimale')} />
          </div>
          <div className="field">
            <label>Valeur 1 (N)</label>
            <input type="number" step="any" value={form.v1 ?? ''} onChange={set('v1')} />
          </div>
          <div className="field">
            <label>Valeur 2 (N)</label>
            <input type="number" step="any" value={form.v2 ?? ''} onChange={set('v2')} />
          </div>
          <div className="field">
            <label>Valeur 3 (N)</label>
            <input type="number" step="any" value={form.v3 ?? ''} onChange={set('v3')} />
          </div>
          <div className="field">
            <label>Valeur 4 (N)</label>
            <input type="number" step="any" value={form.v4 ?? ''} onChange={set('v4')} />
          </div>
          <div className="field">
            <label>Valeur 5 (N)</label>
            <input type="number" step="any" value={form.v5 ?? ''} onChange={set('v5')} />
          </div>
          <div className="field">
            <label>Valeur 6 (N)</label>
            <input type="number" step="any" value={form.v6 ?? ''} onChange={set('v6')} />
          </div>
          <div className="field">
            <label>Prochaine date</label>
            <input type="date" value={form.prochaine_date || ''} onChange={set('prochaine_date')} />
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