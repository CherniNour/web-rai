import { useEffect, useState } from 'react';
import { api } from '../api';
import { useFetch } from './hooks';
import DataTable from './DataTable';
import Modal from './Modal';
import { useToast } from './Toast';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';

export default function CrudPage({
  endpoint,
  columns,
  fields,
  title,
  subtitle,
  canWrite,
  canDelete,
  transform,
}) {
  const { data, loading, error, reload } = useFetch(endpoint);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({});

  const optionSources = fields
    .filter((f) => f.type === 'select' && f.optionsSource)
    .map((f) => f.optionsSource);

  useEffect(() => {
    if (!optionSources.length) return;
    let active = true;
    Promise.all(optionSources.map((src) => api.get(src)))
      .then((results) => {
        if (!active) return;
        const map = {};
        optionSources.forEach((src, i) => {
          map[src] = results[i];
        });
        setOptions(map);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function resolveOptions(field) {
    if (field.optionsSource) {
      const list = options[field.optionsSource] || [];
      return list.map((item) => ({
        value: item._id,
        label: field.optionLabelKey ? item[field.optionLabelKey] : item.nom || item.designation || item.reference,
      }));
    }
    return field.options || [];
  }

  function openCreate() {
    const init = {};
    fields.forEach((f) => {
      init[f.name] = f.default || '';
    });
    setForm(init);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    const init = {};
    fields.forEach((f) => {
      const raw = row[f.name];
      let value = raw && typeof raw === 'object' && raw._id ? raw._id : raw !== undefined ? raw : '';
      if (f.type === 'date' && value && typeof value === 'string' && value.includes('T')) {
        value = value.slice(0, 10);
      }
      init[f.name] = value;
    });
    setForm(init);
    setEditing(row);
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if ((!payload[f.name] || payload[f.name] === '') && f.optional) delete payload[f.name];
      });
      if (editing) await api.put(`${endpoint}/${editing._id}`, payload);
      else await api.post(endpoint, payload);
      toast(editing ? 'Modifié avec succès' : 'Créé avec succès');
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await api.del(`${endpoint}/${row._id}`);
      toast('Supprimé avec succès');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const actionCol = {
    key: '_actions',
    label: 'Actions',
    render: (row) => (
      <div className="row-actions">
        {canWrite && (
          <button className="icon-btn icon-btn-edit" onClick={() => openEdit(row)} title="Modifier" aria-label="Modifier">
            <PencilIcon size={15} />
          </button>
        )}
        {canDelete && (
          <button className="icon-btn icon-btn-danger" onClick={() => remove(row)} title="Supprimer" aria-label="Supprimer">
            <TrashIcon size={15} />
          </button>
        )}
      </div>
    ),
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 style={{ color: 'var(--primary)' }}>{title}</h2>
          {subtitle && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{subtitle}</span>}
        </div>
        {canWrite && (
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
        <DataTable columns={[...columns, actionCol]} data={transform ? data.map(transform) : data || []} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Modifier ${title.toLowerCase()}` : `Nouveau - ${title}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button className="btn" onClick={save} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form onSubmit={save}>
          <div className="form-grid">
            {fields.map((f) => (
              <div className="field" key={f.name} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.name] || ''}
                    onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  >
                    <option value="">-- Sélectionner --</option>
                    {resolveOptions(f).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] || ''}
                    onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  />
                ) : f.type === 'number' ? (
                  <input
                    type="number"
                    step="any"
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}