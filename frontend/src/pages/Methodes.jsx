import { useState } from 'react';
import CrudPage from '../components/CrudPage';
import { useAuth } from '../context/AuthContext';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

function Clients() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/clients"
      title="Clients"
      subtitle="Référentiel des clients"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'nom', label: 'Client' },
        { key: 'adresse', label: 'Adresse' },
        { key: 'contact', label: 'Contact' },
      ]}
      fields={[
        { name: 'nom', label: 'Client *' },
        { name: 'adresse', label: 'Adresse' },
        { name: 'contact', label: 'Contact' },
      ]}
    />
  );
}

function TypesProduits() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/types-produits"
      title="Types de produits"
      subtitle="Référentiel des types de produits"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[{ key: 'designation', label: 'Désignation' }]}
      fields={[{ name: 'designation', label: 'Désignation *' }]}
    />
  );
}

function Produits() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/produits"
      title="Produits"
      subtitle="Référentiel des produits"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'designation', label: 'Désignation' },
        { key: 'indice', label: 'Indice' },
        { key: 'type_produit', label: 'Type', render: (r) => (r.type_produit ? r.type_produit.designation : '') },
        { key: 'client', label: 'Client', render: (r) => (r.client ? r.client.nom : '') },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *', placeholder: 'PROD-A1' },
        { name: 'designation', label: 'Désignation' },
        { name: 'indice', label: 'Indice' },
        {
          name: 'type_produit',
          label: 'Type de produit',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/types-produits',
          optionLabelKey: 'designation',
        },
        {
          name: 'client',
          label: 'Client',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/clients',
          optionLabelKey: 'nom',
        },
      ]}
    />
  );
}

function Lieux() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/lieux-classement"
      title="Lieux de classement"
      subtitle="Référentiel des lieux de classement"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[{ key: 'lieu', label: 'Lieu' }]}
      fields={[{ name: 'lieu', label: 'Lieu *', placeholder: 'Armoire M1' }]}
    />
  );
}

function Specifications() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/specifications"
      title="Spécifications"
      subtitle="Référentiel des spécifications"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'reference', label: 'Référence', render: (r) => <span className="mono">{r.reference}</span> },
        { key: 'designation', label: 'Désignation' },
        { key: 'indice', label: 'Indice' },
        { key: 'date_reception', label: 'Réception', render: (r) => fmtDate(r.date_reception) },
        { key: 'client', label: 'Client', render: (r) => (r.client ? r.client.nom : '') },
        { key: 'lieu_classement', label: 'Lieu', render: (r) => (r.lieu_classement ? r.lieu_classement.lieu : '') },
        { key: 'nombre_copies', label: 'Copies' },
      ]}
      fields={[
        { name: 'reference', label: 'Référence *' },
        { name: 'designation', label: 'Désignation' },
        { name: 'indice', label: 'Indice' },
        { name: 'date_reception', label: 'Date de réception', type: 'date' },
        {
          name: 'client',
          label: 'Client',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/clients',
          optionLabelKey: 'nom',
        },
        {
          name: 'lieu_classement',
          label: 'Lieu de classement',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/lieux-classement',
          optionLabelKey: 'lieu',
        },
        { name: 'nombre_copies', label: 'Nombre de copies', type: 'number' },
      ]}
    />
  );
}

function Dossiers() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <CrudPage
      endpoint="/api/methodes/dossiers"
      title="Dossiers de fabrication"
      subtitle="Référentiel des dossiers de méthodes"
      canWrite={isMaint}
      canDelete={isAdmin}
      columns={[
        { key: 'ref_produit', label: 'Réf. produit', render: (r) => (r.ref_produit ? <span className="mono">{r.ref_produit.reference}</span> : '') },
        { key: 'designation', label: 'Désignation' },
        { key: 'client', label: 'Client', render: (r) => (r.client ? r.client.nom : '') },
        { key: 'type_produit', label: 'Type', render: (r) => (r.type_produit ? r.type_produit.designation : '') },
        { key: 'lieu_classement', label: 'Lieu', render: (r) => (r.lieu_classement ? r.lieu_classement.lieu : '') },
        { key: 'nombre_copies', label: 'Copies' },
        { key: 'date_creation', label: 'Création', render: (r) => fmtDate(r.date_creation) },
      ]}
      fields={[
        {
          name: 'ref_produit',
          label: 'Réf. produit',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/produits',
          optionLabelKey: 'reference',
        },
        { name: 'designation', label: 'Désignation' },
        {
          name: 'client',
          label: 'Client',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/clients',
          optionLabelKey: 'nom',
        },
        {
          name: 'type_produit',
          label: 'Type produit',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/types-produits',
          optionLabelKey: 'designation',
        },
        {
          name: 'lieu_classement',
          label: 'Lieu de classement',
          type: 'select',
          optional: true,
          optionsSource: '/api/methodes/lieux-classement',
          optionLabelKey: 'lieu',
        },
        { name: 'nombre_copies', label: 'Nombre de copies', type: 'number' },
      ]}
    />
  );
}

export default function Methodes() {
  const [tab, setTab] = useState('clients');
  const tabs = [
    { id: 'clients', label: 'Clients' },
    { id: 'types', label: 'Types produits' },
    { id: 'produits', label: 'Produits' },
    { id: 'lieux', label: 'Lieux classement' },
    { id: 'specifications', label: 'Spécifications' },
    { id: 'dossiers', label: 'Dossiers fabrication' },
  ];
  return (
    <div>
      <div className="page-title">
        <h1>Gestion des dossiers de méthodes</h1>
        <p>Clients, produits, spécifications et dossiers de fabrication</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'clients' && <Clients />}
      {tab === 'types' && <TypesProduits />}
      {tab === 'produits' && <Produits />}
      {tab === 'lieux' && <Lieux />}
      {tab === 'specifications' && <Specifications />}
      {tab === 'dossiers' && <Dossiers />}
    </div>
  );
}
