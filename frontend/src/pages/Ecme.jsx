import { useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

const ETAT_BADGE = {
  OK: 'badge-ok',
  CRITIQUE: 'badge-warn',
  ECHUE: 'badge-nok',
  A_VERIFIER: 'badge-gray',
};
const ETAT_LABEL = {
  OK: 'OK',
  CRITIQUE: 'Échéance 30j',
  ECHUE: 'Échue',
  A_VERIFIER: 'À vérifier',
};

function Etat() {
  const { data, loading, error } = useFetch('/api/ecme/etat');
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
          Chargement...
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'code_ecme', label: 'Code', render: (r) => <span className="mono">{r.code_ecme}</span> },
            { key: 'designation', label: 'Désignation' },
            { key: 'marque', label: 'Marque' },
            { key: 'modele', label: 'Modèle' },
            { key: 'affectation', label: 'Affectation' },
            { key: 'grandeur', label: 'Grandeur' },
            { key: 'tolerance', label: 'Tolérance' },
            {
              key: 'statut',
              label: 'Statut',
              render: (r) => <span className={`badge ${ETAT_BADGE[r.statut] || 'badge-gray'}`}>{ETAT_LABEL[r.statut] || r.statut}</span>,
            },
            {
              key: 'derniereVerification',
              label: 'Prochaine vérification',
              render: (r) =>
                r.derniereVerification ? fmtDate(r.derniereVerification.date_prochaine_verification) : '—',
            },
            { key: 'nombreVerifications', label: 'Nb vérifications' },
          ]}
          data={data || []}
        />
      )}
    </div>
  );
}

function Referentiel() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/ecme/ecme"
      title="Référentiel des ECME"
      subtitle="Équipements de contrôle, de mesure et d'essai"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'code_ecme', label: 'Code', render: (r) => <span className="mono">{r.code_ecme}</span> },
        { key: 'designation', label: 'Désignation' },
        { key: 'marque', label: 'Marque' },
        { key: 'numero_serie', label: 'N° Série' },
        { key: 'propriete', label: 'Propriété', render: (r) => r.propriete },
        { key: 'verification', label: 'Vérification', render: (r) => (r.verification === 'EXTERNE' ? 'Externe' : 'Interne') },
        { key: 'affectation', label: 'Affectation' },
        { key: 'grandeur', label: 'Grandeur' },
      ]}
      fields={[
        { name: 'code_ecme', label: 'Code ECME *', placeholder: 'ECME-XXX' },
        { name: 'designation', label: 'Désignation' },
        { name: 'marque', label: 'Marque' },
        { name: 'modele', label: 'Modèle' },
        { name: 'numero_serie', label: 'N° de série' },
        { name: 'date_achat', label: 'Date d\u2019achat', type: 'date' },
        { name: 'date_mise_en_service', label: 'Date de mise en service', type: 'date' },
        {
          name: 'propriete',
          label: 'Propriété',
          type: 'select',
          options: [
            { value: 'RAI', label: 'RAI' },
            { value: 'CLIENT', label: 'Client' },
          ],
        },
        {
          name: 'verification',
          label: 'Vérification',
          type: 'select',
          options: [
            { value: 'INTERNE', label: 'Interne' },
            { value: 'EXTERNE', label: 'Externe' },
          ],
        },
        { name: 'affectation', label: 'Affectation' },
        { name: 'date_affectation', label: 'Date affectation', type: 'date' },
        { name: 'grandeur', label: 'Grandeur', placeholder: 'Ex : Force (N)' },
        { name: 'tolerance', label: 'Tolérance', placeholder: 'Ex : ±1 N' },
      ]}
    />
  );
}

function Verifications() {
  const { data, loading, reload, error } = useFetch('/api/ecme/verifications');
  const { data: ecmes } = useFetch('/api/ecme/ecme');
  const { user } = useAuth();
  const toast = useToast();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({
      ecme: '',
      date_verification: '',
      date_prochaine_verification: '',
      statut: 'CONFORME',
      remarques: '',
    });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      ecme: row.ecme?._id || row.ecme || '',
      date_verification: row.date_verification ? row.date_verification.slice(0, 10) : '',
      date_prochaine_verification: row.date_prochaine_verification ? row.date_prochaine_verification.slice(0, 10) : '',
      statut: row.statut,
      remarques: row.remarques || '',
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.date_verification) delete body.date_verification;
      if (!body.date_prochaine_verification) delete body.date_prochaine_verification;
      if (editing) await api.put(`/api/ecme/verifications/${editing._id}`, body);
      else await api.post('/api/ecme/verifications', body);
      toast(editing ? 'Vérification modifiée' : 'Vérification enregistrée');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm('Supprimer cette vérification ?')) return;
    try {
      await api.del(`/api/ecme/verifications/${row._id}`);
      toast('Supprimée');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'ecme', label: 'ECME', render: (r) => (r.ecme ? <span className="mono">{r.ecme.code_ecme}</span> : '') },
    { key: 'date_verification', label: 'Date vérification', render: (r) => fmtDate(r.date_verification) },
    {
      key: 'date_prochaine_verification',
      label: 'Prochaine',
      render: (r) => fmtDate(r.date_prochaine_verification),
    },
    {
      key: 'statut',
      label: 'Résultat',
      render: (r) => (
        <span className={`badge ${r.statut === 'CONFORME' ? 'badge-ok' : r.statut === 'NON_CONFORME' ? 'badge-nok' : 'badge-warn'}`}>
          {r.statut === 'CONFORME' ? 'Conforme' : r.statut === 'NON_CONFORME' ? 'Non conforme' : 'En cours'}
        </span>
      ),
    },
    { key: 'remarques', label: 'Remarques' },
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
        <h2 style={{ color: 'var(--primary)' }}>Vérifications des ECME</h2>
        {isMaint && (
          <button className="btn" onClick={openCreate}>
            + Enregistrer une vérification
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
        title={editing ? 'Modifier la vérification' : 'Nouvelle vérification'}
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
            <label>ECME *</label>
            <select value={form.ecme || ''} onChange={set('ecme')}>
              <option value="">-- Sélectionner --</option>
              {(ecmes || []).map((e) => (
                <option key={e._id} value={e._id}>
                  {e.code_ecme} - {e.designation}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date de vérification</label>
            <input type="date" value={form.date_verification || ''} onChange={set('date_verification')} />
          </div>
          <div className="field">
            <label>Date prochaine vérification</label>
            <input type="date" value={form.date_prochaine_verification || ''} onChange={set('date_prochaine_verification')} />
          </div>
          <div className="field">
            <label>Résultat</label>
            <select value={form.statut || ''} onChange={set('statut')}>
              <option value="CONFORME">Conforme</option>
              <option value="NON_CONFORME">Non conforme</option>
              <option value="EN_COURS">En cours</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Remarques</label>
            <textarea value={form.remarques || ''} onChange={set('remarques')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function Ecme() {
  const [tab, setTab] = useState('etat');
  const tabs = [
    { id: 'etat', label: 'État des ECME' },
    { id: 'referentiel', label: 'Référentiel' },
    { id: 'verifications', label: 'Vérifications' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Gestion des ECME</h1>
        <p>Équipements de contrôle, de mesure et d'essai - vérifications et étalonnages</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'etat' && <Etat />}
      {tab === 'referentiel' && <Referentiel />}
      {tab === 'verifications' && <Verifications />}
    </div>
  );
}
