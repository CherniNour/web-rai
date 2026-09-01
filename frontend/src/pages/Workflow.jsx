import { useRef, useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function Outils() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/workflow/outils"
      title="Outils"
      subtitle="Référentiel des outils"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'nom', label: 'Outil' },
        { key: 'reference', label: 'Référence' },
      ]}
      fields={[
        { name: 'nom', label: 'Outil *' },
        { name: 'reference', label: 'Référence' },
      ]}
    />
  );
}

function Composants() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/workflow/composants"
      title="Composants"
      subtitle="Référentiel des composants"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'designation', label: 'Désignation' },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *' },
        { name: 'designation', label: 'Désignation' },
      ]}
    />
  );
}

function Operations() {
  const { data, loading, reload, error } = useFetch('/api/workflow/operations');
  const { data: equipements } = useFetch('/api/inventaire/equipements');
  const { data: outils } = useFetch('/api/workflow/outils');
  const { data: ressources } = useFetch('/api/workflow/ressources');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, setValue, reset } = useForm({});

  function openCreate() {
    reset({ code: '', libelle: '', ordre: '', equipement: '', outils: [], parametres: '', ressources: [] });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      code: row.code,
      libelle: row.libelle || '',
      ordre: row.ordre || '',
      equipement: row.equipement?._id || row.equipement || '',
      outils: (row.outils || []).map((o) => (o._id ? o._id : o)),
      parametres: row.parametres || '',
      ressources: (row.ressources || []).map((r) => (r._id ? r._id : r)),
    });
    setEditing(row);
    setOpen(true);
  }

  function toggleArr(field, id) {
    setValue(
      field,
      (form[field] || []).includes(id) ? form[field].filter((x) => x !== id) : [...(form[field] || []), id]
    );
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = {
        code: form.code,
        libelle: form.libelle,
        ordre: Number(form.ordre || 0),
        equipement: form.equipement || undefined,
        outils: form.outils || [],
        parametres: form.parametres,
        ressources: form.ressources || [],
      };
      if (editing) await api.put(`/api/workflow/operations/${editing._id}`, body);
      else await api.post('/api/workflow/operations', body);
      toast(editing ? 'Opération modifiée' : 'Opération créée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette opération ?')) return;
    try {
      await api.del(`/api/workflow/operations/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="mono">{r.code}</span> },
    { key: 'libelle', label: 'Libellé' },
    { key: 'ordre', label: 'Ordre' },
    { key: 'equipement', label: 'Équipement', render: (r) => (r.equipement ? r.equipement.code_rai : '') },
    { key: 'outils', label: 'Outils', render: (r) => (r.outils || []).map((o) => (o.nom || o)).join(', ') },
    { key: 'parametres', label: 'Paramètres' },
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
        <h2 style={{ color: 'var(--primary)' }}>Opérations</h2>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            + Nouvelle opération
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
        title={editing ? 'Modifier l\u2019opération' : 'Nouvelle opération'}
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
            <label>Code *</label>
            <input value={form.code || ''} onChange={set('code')} placeholder="OP-010" />
          </div>
          <div className="field">
            <label>Libellé</label>
            <input value={form.libelle || ''} onChange={set('libelle')} />
          </div>
          <div className="field">
            <label>Ordre</label>
            <input type="number" value={form.ordre ?? ''} onChange={set('ordre')} />
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
            <label>Paramètres</label>
            <input value={form.parametres || ''} onChange={set('parametres')} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Outils</label>
            <div className="flex" style={{ flexWrap: 'wrap' }}>
              {(outils || []).map((o) => (
                <label key={o._id} className="flex" style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={(form.outils || []).includes(o._id)}
                    onChange={() => toggleArr('outils', o._id)}
                  />
                  {o.nom}
                </label>
              ))}
            </div>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Ressources descriptives</label>
            <div className="flex" style={{ flexWrap: 'wrap' }}>
              {(ressources || []).map((r) => (
                <label key={r._id} className="flex" style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={(form.ressources || []).includes(r._id)}
                    onChange={() => toggleArr('ressources', r._id)}
                  />
                  {r.titre} <span className="mut">({r.type})</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Ressources() {
  const { data, loading, reload, error } = useFetch('/api/workflow/ressources');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  const fileRef = useRef();
  const [open, setOpen] = useState(false);
  const { form, set, setValue, reset } = useForm({});
  const [uploading, setUploading] = useState(false);

  function openCreate() {
    reset({ titre: '', type: 'PDF', description: '', fichier: null });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('titre', form.titre || '');
      fd.append('type', form.type || 'PDF');
      fd.append('description', form.description || '');
      if (form.fichier) fd.append('fichier', form.fichier);
      await api.post('/api/workflow/ressources/upload', fd);
      toast('Ressource ajoutée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await api.del(`/api/workflow/ressources/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'titre', label: 'Titre' },
    {
      key: 'type',
      label: 'Type',
      render: (r) => (
        <span className={`badge ${r.type === 'VIDEO' ? 'badge-purple' : r.type === 'PDF' ? 'badge-nok' : r.type === 'IMAGE' ? 'badge-info' : 'badge-gray'}`}>
          {r.type}
        </span>
      ),
    },
    { key: 'description', label: 'Description' },
    { key: 'url', label: 'Fichier', render: (r) => (r.url ? <a href={r.url} target="_blank" rel="noreferrer">Voir</a> : '') },
    { key: 'uploader', label: 'Ajouté par' },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) =>
        isAdmin ? (
          <button className="btn btn-danger-outline btn-sm" onClick={() => remove(r)}>
            Supprimer
          </button>
        ) : (
          ''
        ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 style={{ color: 'var(--primary)' }}>Ressources descriptives</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Notes, PDF, vidéos liées aux processus</span>
        </div>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            + Ajouter une ressource
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
        title="Ajouter une ressource"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className="btn" onClick={save} disabled={uploading}>
              {uploading ? 'Envoi...' : 'Ajouter'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="form-grid">
          <div className="field">
            <label>Titre *</label>
            <input value={form.titre || ''} onChange={set('titre')} />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={form.type || 'PDF'} onChange={set('type')}>
              <option value="PDF">PDF</option>
              <option value="NOTE">Note</option>
              <option value="VIDEO">Vidéo</option>
              <option value="IMAGE">Image</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Fichier</label>
            <input
              type="file"
              ref={fileRef}
              onChange={(e) => setValue('fichier', e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg,.mp4,.webm"
            />
            <div className="hint">PDF, images ou vidéos (facultatif si lien via description)</div>
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

function Processus() {
  const { data, loading, reload, error } = useFetch('/api/workflow/fabrications');
  const { data: produits } = useFetch('/api/methodes/produits');
  const { data: operations } = useFetch('/api/workflow/operations');
  const { data: ressources } = useFetch('/api/workflow/ressources');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, setValue, reset } = useForm({});

  function openCreate() {
    reset({ code_processus: '', produit: '', indice: '', operations: [], ressources: [], description: '', statut: 'EN_ELABORATION' });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      code_processus: row.code_processus,
      produit: row.produit?._id || row.produit || '',
      indice: row.indice || '',
      operations: (row.operations || []).map((o) => (o._id ? o._id : o)),
      ressources: (row.ressources || []).map((r) => (r._id ? r._id : r)),
      description: row.description || '',
      statut: row.statut,
    });
    setEditing(row);
    setOpen(true);
  }

  function toggleArr(field, id) {
    setValue(
      field,
      (form[field] || []).includes(id) ? form[field].filter((x) => x !== id) : [...(form[field] || []), id]
    );
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = {
        code_processus: form.code_processus,
        produit: form.produit || undefined,
        indice: form.indice,
        operations: form.operations || [],
        ressources: form.ressources || [],
        description: form.description,
        statut: form.statut,
      };
      if (editing) await api.put(`/api/workflow/fabrications/${editing._id}`, body);
      else await api.post('/api/workflow/fabrications', body);
      toast(editing ? 'Processus modifié' : 'Processus créé');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer ce processus ?')) return;
    try {
      await api.del(`/api/workflow/fabrications/${row._id}`);
      toast('Supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'code_processus', label: 'Code', render: (r) => <span className="mono">{r.code_processus}</span> },
    { key: 'produit', label: 'Produit', render: (r) => (r.produit ? r.produit.reference : '') },
    { key: 'indice', label: 'Indice' },
    {
      key: 'operations',
      label: 'Opérations',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(r.operations || []).map((o) => (
            <span key={o._id} className="badge badge-info">
              {o.code}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'ressources',
      label: 'Ressources',
      render: (r) => <span>{(r.ressources || []).length}</span>,
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (r) => (
        <span className={`badge ${r.statut === 'VALIDE' ? 'badge-ok' : r.statut === 'ARCHIVE' ? 'badge-gray' : 'badge-warn'}`}>
          {r.statut === 'VALIDE' ? 'Validé' : r.statut === 'ARCHIVE' ? 'Archivé' : 'En élaboration'}
        </span>
      ),
    },
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
          <h2 style={{ color: 'var(--primary)' }}>Processus de fabrication</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Workflows avec ressources descriptives</span>
        </div>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            + Nouveau processus
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
        title={editing ? 'Modifier le processus' : 'Nouveau processus de fabrication'}
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
            <label>Code processus *</label>
            <input value={form.code_processus || ''} onChange={set('code_processus')} placeholder="FAB-XXX" />
          </div>
          <div className="field">
            <label>Produit</label>
            <select value={form.produit || ''} onChange={set('produit')}>
              <option value="">-- Sélectionner --</option>
              {(produits || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.reference}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Indice</label>
            <input value={form.indice || ''} onChange={set('indice')} />
          </div>
          <div className="field">
            <label>Statut</label>
            <select value={form.statut || ''} onChange={set('statut')}>
              <option value="EN_ELABORATION">En élaboration</option>
              <option value="VALIDE">Validé</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Opérations</label>
            <div className="flex" style={{ flexWrap: 'wrap' }}>
              {(operations || []).map((o) => (
                <label key={o._id} className="flex" style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={(form.operations || []).includes(o._id)}
                    onChange={() => toggleArr('operations', o._id)}
                  />
                  {o.code} - {o.libelle}
                </label>
              ))}
            </div>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Ressources descriptives</label>
            <div className="flex" style={{ flexWrap: 'wrap' }}>
              {(ressources || []).map((r) => (
                <label key={r._id} className="flex" style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={(form.ressources || []).includes(r._id)}
                    onChange={() => toggleArr('ressources', r._id)}
                  />
                  {r.titre}
                </label>
              ))}
            </div>
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

export default function Workflow() {
  const [tab, setTab] = useState('outils');
  const tabs = [
    { id: 'outils', label: 'Outils' },
    { id: 'composants', label: 'Composants' },
    { id: 'operations', label: 'Opérations' },
    { id: 'ressources', label: 'Ressources' },
    { id: 'processus', label: 'Processus' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Workflows de processus de fabrication</h1>
        <p>Outils, composants, opérations et ressources descriptives (notes, PDF, vidéos)</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'outils' && <Outils />}
      {tab === 'composants' && <Composants />}
      {tab === 'operations' && <Operations />}
      {tab === 'ressources' && <Ressources />}
      {tab === 'processus' && <Processus />}
    </div>
  );
}
