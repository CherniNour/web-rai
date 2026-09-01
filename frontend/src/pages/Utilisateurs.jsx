import { useState } from 'react';
import { useFetch, useForm } from '../components/hooks';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { useToast } from '../components/Toast';

const ROLE_LABEL = { admin: 'Administrateur', maintenance: 'Maintenance / Qualité', operateur: 'Opérateur' };

export default function Utilisateurs() {
  const { data, loading, reload, error } = useFetch('/api/auth/users');
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { form, set, reset } = useForm({});

  function openCreate() {
    reset({ username: '', fullname: '', email: '', password: '', role: 'operateur', active: true });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    reset({
      username: row.username,
      fullname: row.fullname || '',
      email: row.email || '',
      password: '',
      role: row.role,
      active: row.active,
    });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (editing) {
        const body = { ...form };
        if (!body.password) delete body.password;
        await api.put(`/api/auth/users/${editing._id}`, body);
      } else {
        await api.post('/api/auth/users', form);
      }
      toast(editing ? 'Utilisateur modifié' : 'Utilisateur créé');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(row) {
    if (!window.confirm(`Supprimer l'utilisateur ${row.username} ?`)) return;
    try {
      await api.del(`/api/auth/users/${row._id}`);
      toast('Supprimé');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    { key: 'username', label: 'Identifiant', render: (r) => <b>{r.username}</b> },
    { key: 'fullname', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rôle',
      render: (r) => (
        <span className={`badge ${r.role === 'admin' ? 'badge-purple' : r.role === 'maintenance' ? 'badge-info' : 'badge-gray'}`}>
          {ROLE_LABEL[r.role]}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Actif',
      render: (r) => (
        <span className={`badge ${r.active ? 'badge-ok' : 'badge-nok'}`}>{r.active ? 'Oui' : 'Non'}</span>
      ),
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex">
          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>
            Modifier
          </button>
          <button className="btn btn-danger-outline btn-sm" onClick={() => remove(r)}>
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-title">
        <h1>Gestion des utilisateurs</h1>
        <p>Création des comptes et attribution des rôles (Opérateur, Maintenance/Qualité, Administrateur)</p>
      </div>
      <div className="toolbar">
        <h2 style={{ color: 'var(--primary)' }}>Utilisateurs</h2>
        <button className="btn" onClick={openCreate}>
          + Nouvel utilisateur
        </button>
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
        title={editing ? `Modifier ${editing.username}` : 'Nouvel utilisateur'}
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
            <label>Identifiant *</label>
            <input value={form.username || ''} onChange={set('username')} />
          </div>
          <div className="field">
            <label>Nom complet</label>
            <input value={form.fullname || ''} onChange={set('fullname')} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email || ''} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Mot de passe {editing ? '(laisser vide pour ne pas changer)' : '*'}</label>
            <input type="password" value={form.password || ''} onChange={set('password')} />
          </div>
          <div className="field">
            <label>Rôle</label>
            <select value={form.role || 'operateur'} onChange={set('role')}>
              <option value="operateur">Opérateur</option>
              <option value="maintenance">Maintenance / Qualité</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          {editing && (
            <div className="field">
              <label>Actif</label>
              <select value={form.active ? 'true' : 'false'} onChange={(e) => set('active')({ target: { value: e.target.value === 'true' } })}>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
