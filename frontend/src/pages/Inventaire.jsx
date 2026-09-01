import { useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { PencilIcon, TrashIcon, RepeatIcon, PlusIcon } from '../components/Icons';

const STATUS_LABEL = { EN_SERVICE: 'En service', HORS_SERVICE: 'Hors service' };

function StatutBadge({ statut }) {
  return (
    <span className={`badge ${statut === 'EN_SERVICE' ? 'badge-ok' : 'badge-nok'}`}>
      {STATUS_LABEL[statut]}
    </span>
  );
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

function Referentiels() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <CrudPage
          endpoint="/api/inventaire/zones"
          title="Zones"
          subtitle="Référentiel des zones de production"
          canWrite={isAdmin}
          canDelete={isAdmin}
          columns={[
            { key: 'nom_zone', label: 'Nom de la zone' },
            { key: 'localisation', label: 'Localisation' },
          ]}
          fields={[
            { name: 'nom_zone', label: 'Nom de la zone', placeholder: 'Ex : Bobinage' },
            { name: 'localisation', label: 'Localisation', placeholder: 'Ex : Hall A' },
          ]}
        />
      </div>
      <div className="card">
        <CrudPage
          endpoint="/api/inventaire/fabricants"
          title="Fabricants"
          subtitle="Fournisseurs d'équipements"
          canWrite={isAdmin}
          canDelete={isAdmin}
          columns={[
            { key: 'nom', label: 'Nom' },
            { key: 'pays', label: 'Pays' },
            { key: 'contact', label: 'Contact' },
          ]}
          fields={[
            { name: 'nom', label: 'Nom', placeholder: 'Ex : AMADA' },
            { name: 'pays', label: 'Pays' },
            { name: 'contact', label: 'Contact' },
          ]}
        />
      </div>
      <div className="card">
        <CrudPage
          endpoint="/api/inventaire/modeles"
          title="Modèles"
          subtitle="Modèles d'équipements"
          canWrite={isAdmin}
          canDelete={isAdmin}
          columns={[
            { key: 'nom', label: 'Nom' },
            { key: 'fabricant', label: 'Fabricant', render: (r) => (r.fabricant ? r.fabricant.nom : '') },
            { key: 'description', label: 'Description' },
          ]}
          fields={[
            { name: 'nom', label: 'Nom du modèle' },
            {
              name: 'fabricant',
              label: 'Fabricant',
              type: 'select',
              optional: true,
              optionsSource: '/api/inventaire/fabricants',
              optionLabelKey: 'nom',
            },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
        />
      </div>
      <div className="card">
        <CrudPage
          endpoint="/api/inventaire/categories"
          title="Catégories"
          subtitle="Catégories d'équipement"
          canWrite={isAdmin}
          canDelete={isAdmin}
          columns={[
            { key: 'nom', label: 'Nom' },
            { key: 'description', label: 'Description' },
          ]}
          fields={[
            { name: 'nom', label: 'Nom', placeholder: 'Ex : Sertissage' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
        />
      </div>
    </div>
  );
}

function Equipements() {
  const { data: equipements, loading, reload, error } = useFetch('/api/inventaire/equipements');
  const { data: zones } = useFetch('/api/inventaire/zones');
  const { data: fabricants } = useFetch('/api/inventaire/fabricants');
  const { data: modeles } = useFetch('/api/inventaire/modeles');
  const { data: categories } = useFetch('/api/inventaire/categories');
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({
      code_rai: '',
      designation: '',
      numero_serie: '',
      date_acquisition: '',
      remarque: '',
      statut: 'EN_SERVICE',
      zone: '',
      fabricant: '',
      modele: '',
      categorie: '',
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      code_rai: row.code_rai,
      designation: row.designation,
      numero_serie: row.numero_serie,
      date_acquisition: row.date_acquisition ? row.date_acquisition.slice(0, 10) : '',
      remarque: row.remarque || '',
      statut: row.statut,
      zone: row.zone?._id || row.zone || '',
      fabricant: row.fabricant?._id || row.fabricant || '',
      modele: row.modele?._id || row.modele || '',
      categorie: row.categorie?._id || row.categorie || '',
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.date_acquisition) delete body.date_acquisition;
      if (!body.zone) delete body.zone;
      if (!body.fabricant) delete body.fabricant;
      if (!body.modele) delete body.modele;
      if (!body.categorie) delete body.categorie;
      if (editing) await api.put(`/api/inventaire/equipements/${editing._id}`, body);
      else await api.post('/api/inventaire/equipements', body);
      toast(editing ? 'Équipement modifié' : 'Équipement créé');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function changeStatut(row) {
    const next = row.statut === 'EN_SERVICE' ? 'HORS_SERVICE' : 'EN_SERVICE';
    const motif = window.prompt(
      `Passer ${row.code_rai} à "${STATUS_LABEL[next]}" ?\nMotif (optionnel) :`,
      ''
    );
    if (motif === null) return;
    try {
      await api.put(`/api/inventaire/equipements/${row._id}/statut`, { statut: next, motif });
      toast(`Statut mis à jour : ${STATUS_LABEL[next]}`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm(`Supprimer ${row.code_rai} ?`)) return;
    try {
      await api.del(`/api/inventaire/equipements/${row._id}`);
      toast('Équipement supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'code_rai', label: 'Code RAI', render: (r) => <span className="mono">{r.code_rai}</span> },
    { key: 'designation', label: 'Désignation' },
    { key: 'numero_serie', label: 'N° Série' },
    { key: 'categorie', label: 'Catégorie', render: (r) => (r.categorie ? r.categorie.nom : '') },
    { key: 'fabricant', label: 'Fabricant', render: (r) => (r.fabricant ? r.fabricant.nom : '') },
    { key: 'modele', label: 'Modèle', render: (r) => (r.modele ? r.modele.nom : '') },
    { key: 'zone', label: 'Zone', render: (r) => (r.zone ? r.zone.nom_zone : '') },
    { key: 'date_acquisition', label: 'Acquisition', render: (r) => fmtDate(r.date_acquisition) },
    { key: 'statut', label: 'Statut', render: (r) => <StatutBadge statut={r.statut} /> },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <button
            className={`status-toggle-btn ${r.statut === 'EN_SERVICE' ? 'status-toggle-to-nok' : 'status-toggle-to-ok'}`}
            onClick={() => changeStatut(r)}
            title="Mettre à jour le statut"
          >
            <RepeatIcon size={13} />
            {r.statut === 'EN_SERVICE' ? 'Passer HS' : 'Passer en service'}
          </button>
          {isAdmin && (
            <>
              <button className="icon-btn icon-btn-edit" onClick={() => openEdit(r)} title="Modifier" aria-label="Modifier">
                <PencilIcon size={15} />
              </button>
              <button className="icon-btn icon-btn-danger" onClick={() => remove(r)} title="Supprimer" aria-label="Supprimer">
                <TrashIcon size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const canCreate = isAdmin;

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ color: 'var(--primary)' }}>Équipements</h2>
        {canCreate && (
          <button className="btn" onClick={openCreate}>
            <PlusIcon size={15} /> Nouvel équipement
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
        <DataTable columns={columns} data={equipements || []} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Modifier ${editing.code_rai}` : 'Nouvel équipement'}
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
            <label>Code RAI *</label>
            <input value={form.code_rai || ''} onChange={set('code_rai')} placeholder="RAI-0001" />
          </div>
          <div className="field">
            <label>Désignation *</label>
            <input value={form.designation || ''} onChange={set('designation')} />
          </div>
          <div className="field">
            <label>N° de série</label>
            <input value={form.numero_serie || ''} onChange={set('numero_serie')} />
          </div>
          <div className="field">
            <label>Date d'acquisition</label>
            <input type="date" value={form.date_acquisition || ''} onChange={set('date_acquisition')} />
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
            <label>Fabricant</label>
            <select value={form.fabricant || ''} onChange={set('fabricant')}>
              <option value="">-- Sélectionner --</option>
              {(fabricants || []).map((f) => (
                <option key={f._id} value={f._id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Modèle</label>
            <select value={form.modele || ''} onChange={set('modele')}>
              <option value="">-- Sélectionner --</option>
              {(modeles || []).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Catégorie</label>
            <select value={form.categorie || ''} onChange={set('categorie')}>
              <option value="">-- Sélectionner --</option>
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </select>
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

function Sommaire() {
  const { data, loading, error } = useFetch('/api/inventaire/sommaire');

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
        Chargement...
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;

  const zoneTotal = data.parZone.reduce((s, z) => s + z.total, 0);

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card kpi-indigo">
          <div className="kpi-label">Total équipements</div>
          <div className="kpi-value">{data.total}</div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-label">En service</div>
          <div className="kpi-value">{data.enService}</div>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-label">Hors service</div>
          <div className="kpi-value">{data.horsService}</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-label">Taux de défaillance</div>
          <div className="kpi-value">{data.tauxDefaillance}%</div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb">Sommaire par zone de production</h3>
        {data.parZone.map((z) => {
          const pct = z.total ? Math.round((z.en_service / z.total) * 100) : 0;
          return (
            <div key={z.zone} className="zone-bar-row">
              <div className="zone-bar-name">{z.zone || 'Sans zone'}</div>
              <div className="zone-bar-track">
                <span className="zone-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="zone-bar-labels">
                <span className="zone-bar-ok">{z.en_service} EN SVC</span>
                <span className="zone-bar-nok">{z.hors_service} HS</span>
              </div>
            </div>
          );
        })}
        {!data.parZone.length && <div className="empty">Aucune donnée</div>}
        <div className="mut" style={{ marginTop: 10 }}>
          Total réparti en zones : {zoneTotal} équipements
        </div>
      </div>
    </div>
  );
}

export default function Inventaire() {
  const [tab, setTab] = useState('sommaire');
  const tabs = [
    { id: 'sommaire', label: 'Sommaire' },
    { id: 'equipements', label: 'Équipements' },
    { id: 'referentiels', label: 'Référentiels' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Gestion de l'inventaire</h1>
        <p>Traçabilité du statut et de la localisation des équipements de production</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'sommaire' && <Sommaire />}
      {tab === 'equipements' && <Equipements />}
      {tab === 'referentiels' && <Referentiels />}
    </div>
  );
}