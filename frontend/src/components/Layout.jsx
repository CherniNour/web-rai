import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sections = [
  {
    label: 'Production',
    items: [
      { to: '/', label: 'Tableau de bord', icon: 'dashboard', end: true },
      { to: '/inventaire', label: 'Inventaire', icon: 'inventory' },
      { to: '/maintenance', label: 'Maintenance', icon: 'maintenance' },
      { to: '/mesures', label: 'Mesures Qualité', icon: 'quality' },
    ],
  },
  {
    label: 'Métier',
    items: [
      { to: '/ecme', label: 'ECME', icon: 'ecme' },
      { to: '/outillage', label: 'Outillages', icon: 'tools' },
      { to: '/methodes', label: 'Dossiers Méthodes', icon: 'methods' },
      { to: '/workflow', label: 'Workflows', icon: 'workflow' },
      { to: '/indicateurs', label: 'Indicateurs', icon: 'kpi' },
    ],
  },
  {
    label: 'Pilotage',
    items: [
      { to: '/reporting', label: 'Reporting & Rappels', icon: 'reporting' },
      { to: '/utilisateurs', label: 'Utilisateurs', icon: 'users', roles: ['admin'] },
    ],
  },
];

const roleLabels = {
  admin: 'Administrateur',
  maintenance: 'Maintenance / Qualité',
  operateur: 'Opérateur',
};

const pageLabels = {
  '/': 'Tableau de bord',
  '/inventaire': 'Inventaire',
  '/maintenance': 'Maintenance',
  '/mesures': 'Mesures Qualité',
  '/ecme': 'ECME',
  '/outillage': 'Outillages',
  '/methodes': 'Dossiers Méthodes',
  '/workflow': 'Workflows',
  '/indicateurs': 'Indicateurs',
  '/reporting': 'Reporting & Rappels',
  '/utilisateurs': 'Utilisateurs',
};

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    inventory: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
    maintenance: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z" /></>,
    quality: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    ecme: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
    tools: <><path d="m14.7 6.3 3-3a5 5 0 0 0-6.4 6.4L4 17l3 3 7.7-7.3a5 5 0 0 0 6.4-6.4l-3 3-3-3Z" /></>,
    methods: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 5.5V21" /><path d="M8 7h8M8 11h8" /></>,
    workflow: <><rect x="3" y="4" width="6" height="5" rx="1" /><rect x="15" y="4" width="6" height="5" rx="1" /><rect x="9" y="15" width="6" height="5" rx="1" /><path d="M9 6.5h6M18 9v3.5h-6v2.5" /></>,
    kpi: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    reporting: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M17 11a4 4 0 0 0 0-8" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" /></>,
    collapse: <path d="m15 18-6-6 6-6" />,
    expand: <path d="m9 18 6-6-6-6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('web_rai_sidebar') === 'collapsed');
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('web_rai_sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('web_rai_theme', next ? 'dark' : 'light');
  }

  function handleLogout() {
    setProfileOpen(false);
    logout();
    navigate('/login');
  }

  const visibleSections = useMemo(
    () => sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.roles || (user && item.roles.includes(user.role))),
      }))
      .filter((section) => section.items.length),
    [user]
  );

  const currentPage = pageLabels[location.pathname] || 'WEB-RAI';
  const initials = (user?.fullname || user?.username || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`app app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <div className="overlay-nav overlay-modern" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar sidebar-modern ${mobileOpen ? 'open' : ''}`}>
        <div className="brand brand-modern">
          <div className="brand-logo brand-logo-modern">WR</div>
          <div className="brand-copy">
            <h1>WEB-RAI</h1>
            <small>Production &amp; Méthodes</small>
          </div>
        </div>

        <div className="sidebar-collapse-row">
          <span>Navigation</span>
          <button
            className="sidebar-collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          >
            <Icon name={collapsed ? 'expand' : 'collapse'} size={15} />
          </button>
        </div>

        <nav className="nav nav-modern">
          {visibleSections.map((section) => (
            <div className="nav-group" key={section.label}>
              <div className="nav-section nav-section-modern">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="nav-icon"><Icon name={item.icon} size={17} /></span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-chevron"><Icon name="chevron" size={14} /></span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {user && (
          <div className="sidebar-footer sidebar-footer-modern">
            <div className="user-chip user-chip-modern">
              <div className="avatar avatar-modern">{initials}</div>
              <div className="user-copy">
                <div className="user-name">{user.fullname || user.username}</div>
                <div className="role-label">{roleLabels[user.role]}</div>
              </div>
            </div>
            <button className="logout-mini" onClick={handleLogout} title="Déconnexion" aria-label="Déconnexion">
              <Icon name="logout" size={16} />
            </button>
          </div>
        )}
      </aside>

      <div className="main main-modern">
        <header className="topbar topbar-modern">
          <button className="burger burger-modern" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
            <Icon name="menu" size={20} />
          </button>

          <div className="breadcrumb">
            <span className="breadcrumb-home">WEB-RAI</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{currentPage}</strong>
          </div>

          <div className="topbar-spacer" />

          <button className="topbar-icon-button" title="Notifications" aria-label="Notifications">
            <Icon name="bell" size={18} />
            <span className="notification-dot" />
          </button>

          <button className="topbar-icon-button" onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'} aria-label="Basculer le thème">
            <Icon name={isDark ? 'sun' : 'moon'} size={17} />
          </button>

          {user && (
            <div className="profile-wrap">
              <button className={`profile-button ${profileOpen ? 'open' : ''}`} onClick={() => setProfileOpen((value) => !value)}>
                <span className="profile-avatar">{initials}</span>
                <span className="profile-info">
                  <strong>{user.fullname || user.username}</strong>
                  <small>{roleLabels[user.role]}</small>
                </span>
                <Icon name="chevron" size={15} />
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-head">
                    <div className="profile-avatar profile-avatar-lg">{initials}</div>
                    <div>
                      <strong>{user.fullname || user.username}</strong>
                      <span>{user.username}</span>
                    </div>
                  </div>
                  <div className="profile-menu-role">{roleLabels[user.role]}</div>
                  <button className="profile-logout" onClick={handleLogout}>
                    <Icon name="logout" size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="content content-modern">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
