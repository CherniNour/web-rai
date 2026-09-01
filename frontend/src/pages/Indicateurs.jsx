import CrudPage from '../components/CrudPage';
import { useAuth } from '../context/AuthContext';

const CAT_LABEL = {
  METHODE: 'Méthode',
  INDUSTRIALISATION: 'Industrialisation',
  QUALITE: 'Qualité',
  PRODUCTION: 'Production',
};

export default function Indicateurs() {
  const { user } = useAuth();
  const isMaint = ['maintenance', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';
  return (
    <div>
      <div className="page-title">
        <h1>Indicateurs méthode-industrialisation</h1>
        <p>Suivi des indicateurs clés de performance des processus</p>
      </div>
      <CrudPage
        endpoint="/api/indicateurs/indicateurs"
        title="Indicateurs"
        canWrite={isMaint}
        canDelete={isAdmin}
        columns={[
          { key: 'code', label: 'Code', render: (r) => <span className="mono">{r.code}</span> },
          { key: 'libelle', label: 'Libellé' },
          {
            key: 'categorie',
            label: 'Catégorie',
            render: (r) => (
              <span className="badge badge-info">{CAT_LABEL[r.categorie] || r.categorie}</span>
            ),
          },
          { key: 'periode', label: 'Période', render: (r) => <span className="mono">{r.periode}</span> },
          { key: 'cible', label: 'Cible' },
          { key: 'valeur', label: 'Valeur', render: (r) => <b>{r.valeur} {r.unite}</b> },
          {
            key: '_progress',
            label: 'Avancement',
            render: (r) => {
              if (!r.cible) return '';
              const pct = Math.min(100, Math.round((r.valeur / r.cible) * 100));
              const ok = pct >= 100;
              return (
                <div style={{ minWidth: 140 }}>
                  <div className={`bar ${ok ? 'bar-green' : 'bar-red'}`}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mut">{pct}% de la cible</div>
                </div>
              );
            },
          },
          { key: 'commentaire', label: 'Commentaire' },
        ]}
        fields={[
          { name: 'code', label: 'Code *', placeholder: 'KPI-M01' },
          { name: 'libelle', label: 'Libellé *' },
          {
            name: 'categorie',
            label: 'Catégorie',
            type: 'select',
            options: Object.entries(CAT_LABEL).map(([value, label]) => ({ value, label })),
          },
          { name: 'periode', label: 'Période', placeholder: 'S31-2026' },
          { name: 'unite', label: 'Unité', placeholder: '%' },
          { name: 'cible', label: 'Cible', type: 'number' },
          { name: 'valeur', label: 'Valeur', type: 'number' },
          { name: 'commentaire', label: 'Commentaire', type: 'textarea', full: true },
        ]}
      />
    </div>
  );
}
