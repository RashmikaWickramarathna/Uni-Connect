import React, { useEffect, useState } from 'react';
import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ApprovalRegistration from '../../components/society/ApprovalRegistration';
import EventCalendar from '../../components/society/EventCalendar';
import EventCard from '../../components/society/EventCard';
import EventForm from '../../components/society/EventForm';
import NotificationBanner from '../../components/society/NotificationBanner';
import PostGenerator from '../../components/society/PostGenerator';
import {
  createEvent,
  deleteEvent,
  getSocietyEvents,
  updateEvent,
} from '../../api/societyPortalApi';
import { useTheme } from '../../context/ThemeContext';
import {
  clearStoredSocietyUser,
  readStoredSocietyUser,
  storeSocietyUser,
} from '../../utils/societySession';
import '../../styles/societyPortal.css';

const safeText = (value) => String(value ?? '');

const normalizeStatus = (status) => {
  const normalized = safeText(status).toLowerCase();
  if (normalized === 'published') return 'approved';
  if (normalized === 'draft') return 'pending';
  return normalized || 'pending';
};

const normalizeEvent = (event) => ({
  ...event,
  title: safeText(event?.title).trim() || 'Untitled Event',
  description: safeText(event?.description),
  organizer: safeText(event?.organizer).trim() || 'Unknown Society',
  organizerEmail: safeText(event?.organizerEmail).trim().toLowerCase(),
  venue: safeText(event?.venue).trim() || 'TBA',
  category: safeText(event?.category).trim() || 'Other',
  date: safeText(event?.date),
  time: safeText(event?.time),
  status: normalizeStatus(event?.status),
  maxParticipants: Number(event?.maxParticipants) > 0 ? Number(event.maxParticipants) : 100,
  tags: Array.isArray(event?.tags) ? event.tags : [],
  views: Number.isFinite(Number(event?.views)) ? Number(event.views) : 0,
});

const withOwnedEventFields = (formData, currentUser) => {
  const next = new FormData();
  for (const [key, value] of formData.entries()) {
    next.append(key, value);
  }
  if (currentUser?.name) next.set('organizer', currentUser.name);
  if (currentUser?.email) next.set('organizerEmail', currentUser.email);
  return next;
};

const PAGE_META = {
  dashboard: {
    kicker: 'Uni-Connect society portal',
    title: 'My Events',
    subtitle: 'Track submissions, approval states, and upcoming activity with the same product styling as the main app.',
  },
  create: {
    kicker: 'Uni-Connect society portal',
    title: 'Create Event',
    subtitle: 'Prepare event details in the shared Uni-Connect dashboard shell before sending them for admin approval.',
  },
  calendar: {
    kicker: 'Uni-Connect society portal',
    title: 'Event Calendar',
    subtitle: 'See your society schedule in one place, with approved and pending events clearly separated.',
  },
};

const TABS = [
  { key: 'dashboard', label: 'My Events', note: 'Status overview', short: 'EV' },
  { key: 'create', label: 'Create Event', note: 'New submission', short: 'CR' },
  { key: 'calendar', label: 'Calendar', note: 'Schedule view', short: 'CA' },
];

function SidebarNavItem({ active, label, note, short, onClick }) {
  return (
    <button type="button" className={`panel-nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="panel-nav-icon">{short}</span>
      <span className="panel-nav-copy">
        <strong>{label}</strong>
        <span>{note}</span>
      </span>
    </button>
  );
}

function StatCard({ active, accent, soft, label, note, short, value, onClick }) {
  return (
    <article
      className={`panel-stat-card${active ? ' is-active' : ''}`}
      style={{ '--stat-accent': accent, '--stat-soft': soft }}
      onClick={onClick}
    >
      <div className="panel-stat-card-header">
        <span className="panel-stat-icon">{short}</span>
        <div className="panel-stat-value">{value}</div>
      </div>
      <div className="panel-stat-label">{label}</div>
      <div className="panel-stat-note">{note}</div>
    </article>
  );
}

export default function SocialDashboard() {
  const navigate = useNavigate();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => readStoredSocietyUser());
  const [approvalToken, setApprovalToken] = useState(
    () => new URLSearchParams(window.location.search).get('approvalToken')
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState(null);
  const [postEvent, setPostEvent] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ msg: message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const clearApprovalToken = () => {
    setApprovalToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleRegistrationComplete = (registeredSociety) => {
    const nextUser = storeSocietyUser(registeredSociety?.account);

    if (!nextUser) {
      showToast('Society account was created, but starting the session failed.', 'error');
      clearApprovalToken();
      navigate('/social-login', { replace: true });
      return;
    }

    setUser(nextUser);
    clearApprovalToken();
    showToast(registeredSociety?.message || 'Society account created successfully. You are now signed in.');
  };

  const handleLogout = () => {
    clearStoredSocietyUser();
    setUser(null);
    navigate('/social-login', { replace: true });
  };

  useEffect(() => {
    if (approvalToken) return;

    const storedUser = readStoredSocietyUser();

    if (!storedUser) {
      navigate('/social-login', { replace: true });
      return;
    }

    if (
      !user ||
      storedUser.email !== user.email ||
      storedUser.name !== user.name ||
      storedUser.id !== user.id
    ) {
      setUser(storedUser);
    }
  }, [approvalToken, navigate, user]);

  const fetchEvents = async (showLoading = true) => {
    if (!user?.email) {
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await getSocietyEvents(user.email, user.name);
      setEvents((response.data || []).map(normalizeEvent));
    } catch {
      showToast('Failed to load events.', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (approvalToken || !user?.email) return undefined;

    fetchEvents();

    const handleFocus = () => {
      fetchEvents(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [approvalToken, user?.email, user?.name]);

  const handleCreate = async (formData) => {
    const response = await createEvent(withOwnedEventFields(formData, user));
    setEvents((previous) => [normalizeEvent(response.data), ...previous]);
    showToast('Event created and sent for admin approval.');
    setActiveTab('dashboard');
  };

  const handleUpdate = async (formData) => {
    const response = await updateEvent(editData._id, withOwnedEventFields(formData, user));
    setEvents((previous) =>
      previous.map((event) => (event._id === editData._id ? normalizeEvent(response.data) : event))
    );
    setEditData(null);
    showToast('Event updated successfully.');
    setActiveTab('dashboard');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(id);
    setEvents((previous) => previous.filter((event) => event._id !== id));
    showToast('Event deleted.', 'warning');
  };

  const handleEdit = (event) => {
    setEditData(event);
    setActiveTab('create');
  };

  const stats = {
    total: events.length,
    pending: events.filter((event) => event.status === 'pending').length,
    approved: events.filter((event) => event.status === 'approved').length,
    rejected: events.filter((event) => event.status === 'rejected').length,
  };

  const existingEvents = events.map((event) => ({
    date: event.date,
    time: event.time,
    venue: event.venue,
    title: event.title,
    id: event._id,
  }));

  let filtered = filter === 'all' ? events : events.filter((event) => event.status === filter);
  if (search.trim()) {
    const searchValue = search.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        safeText(event.title).toLowerCase().includes(searchValue) ||
        safeText(event.venue).toLowerCase().includes(searchValue) ||
        safeText(event.category).toLowerCase().includes(searchValue)
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingSoon = events.filter((event) => {
    if (event.status !== 'approved' || !event.date) return false;
    const diff = Math.ceil((new Date(`${event.date}T00:00:00`) - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  const spotlightStats = [
    { label: 'Pending', value: stats.pending, accent: '#f59e0b' },
    { label: 'Approved', value: stats.approved, accent: '#10b981' },
    { label: 'Rejected', value: stats.rejected, accent: '#ef4444' },
  ];

  const statCards = [
    {
      label: 'Total Events',
      note: 'Everything your society has submitted or updated.',
      value: stats.total,
      accent: '#2563eb',
      soft: 'rgba(37, 99, 235, 0.12)',
      short: 'ALL',
      filterValue: 'all',
    },
    {
      label: 'Pending',
      note: 'Waiting for the admin team to review.',
      value: stats.pending,
      accent: '#f59e0b',
      soft: 'rgba(245, 158, 11, 0.16)',
      short: 'PEN',
      filterValue: 'pending',
    },
    {
      label: 'Approved',
      note: 'Ready to run and visible in your schedule.',
      value: stats.approved,
      accent: '#10b981',
      soft: 'rgba(16, 185, 129, 0.14)',
      short: 'APP',
      filterValue: 'approved',
    },
    {
      label: 'Rejected',
      note: 'Needs a fix before it can be resubmitted.',
      value: stats.rejected,
      accent: '#ef4444',
      soft: 'rgba(239, 68, 68, 0.14)',
      short: 'REJ',
      filterValue: 'rejected',
    },
  ];

  const pageKey = activeTab === 'create' && editData ? 'create' : activeTab;
  const currentMeta = {
    ...PAGE_META[pageKey],
    title: activeTab === 'create' && editData ? 'Edit Event' : PAGE_META[pageKey].title,
  };
  const ThemeIcon = theme === 'system' ? FiMonitor : resolvedTheme === 'dark' ? FiSun : FiMoon;
  const themeLabel =
    theme === 'system'
      ? 'Theme is following your system preference'
      : resolvedTheme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode';

  if (!approvalToken && !user) {
    return (
      <div className="society-dashboard-page">
        <section className="panel-loading" style={{ margin: '24px' }}>
          <h3>Redirecting to society login</h3>
          <p>Loading the approved society account flow for this portal session.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="society-dashboard-page">
      {approvalToken ? (
        <ApprovalRegistration
          token={approvalToken}
          onRegistered={handleRegistrationComplete}
          onDismiss={clearApprovalToken}
        />
      ) : (
        <div className="panel-shell">
          {toast ? <div className={`panel-toast ${toast.type || 'success'}`}>{toast.msg}</div> : null}
          {postEvent ? <PostGenerator event={postEvent} onClose={() => setPostEvent(null)} /> : null}

          <aside className="panel-sidebar">
            <div className="panel-brand">
              <div className="panel-brand-mark">SC</div>
              <div className="panel-brand-copy">
                <div className="panel-brand-title">Uni-Connect</div>
                <div className="panel-brand-sub">Society portal</div>
              </div>
            </div>

            <nav className="panel-nav" aria-label="Society navigation">
              {TABS.map((tab) => (
                <SidebarNavItem
                  key={tab.key}
                  active={activeTab === tab.key}
                  label={tab.label}
                  note={tab.note}
                  short={tab.short}
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key !== 'create') {
                      setEditData(null);
                    }
                  }}
                />
              ))}
            </nav>

            {upcomingSoon.length > 0 ? (
              <div className="panel-sidebar-card">
                <h3>Upcoming soon</h3>
                <p>Your next approved events for the next seven days.</p>
                <div className="panel-sidebar-list">
                  {upcomingSoon.slice(0, 2).map((event) => (
                    <div key={event._id} className="panel-sidebar-entry">
                      <strong>{event.title}</strong>
                      <span>{event.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="panel-sidebar-card metrics">
              <h3>Portal snapshot</h3>
              <p>
                Plan, submit, and track society events in a layout that now matches the rest of
                Uni-Connect.
              </p>
              <div className="panel-sidebar-stats">
                <div className="panel-sidebar-stat">
                  <strong>{stats.total}</strong>
                  <span>Total</span>
                </div>
                <div className="panel-sidebar-stat">
                  <strong>{stats.pending}</strong>
                  <span>Pending</span>
                </div>
                <div className="panel-sidebar-stat">
                  <strong>{stats.approved}</strong>
                  <span>Approved</span>
                </div>
                <div className="panel-sidebar-stat">
                  <strong>{stats.rejected}</strong>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="panel-main">
            <header className="panel-topbar">
              <div className="panel-topbar-copy">
                <p className="panel-kicker">{currentMeta.kicker}</p>
                <h1 className="panel-page-title">{currentMeta.title}</h1>
                <p className="panel-page-subtitle">{currentMeta.subtitle}</p>
              </div>

              <div className="panel-topbar-right">
                <button
                  type="button"
                  className="panel-theme-button"
                  onClick={toggleTheme}
                  aria-label={themeLabel}
                  title={themeLabel}
                >
                  <ThemeIcon />
                  <span>{theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <NotificationBanner userEmail={user.email} />
                <button type="button" className="panel-logout-button" onClick={handleLogout}>
                  Sign Out
                </button>
                <div className="panel-profile">
                  <div className="panel-avatar">{safeText(user.name).slice(0, 2).toUpperCase()}</div>
                  <div className="panel-profile-copy">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="panel-content">
              {activeTab === 'dashboard' ? (
                <>
                  <section className="panel-spotlight">
                    <div className="panel-spotlight-copy">
                      <p className="panel-kicker">Society event workspace</p>
                      <h2>Create, track, and refine your events in the same Uni-Connect design system.</h2>
                      <p>
                        The society dashboard now follows the shared admin-style UI, so your event
                        planning, status tracking, and scheduling experience feels connected to the
                        rest of the platform.
                      </p>
                    </div>

                    <div className="panel-spotlight-stats">
                      {spotlightStats.map((item) => (
                        <div key={item.label} className="panel-spotlight-stat">
                          <strong style={{ color: item.accent }}>{item.value}</strong>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="panel-stat-grid">
                    {statCards.map((card) => (
                      <StatCard
                        key={card.label}
                        active={filter === card.filterValue}
                        accent={card.accent}
                        soft={card.soft}
                        label={card.label}
                        note={card.note}
                        short={card.short}
                        value={card.value}
                        onClick={() => setFilter(card.filterValue)}
                      />
                    ))}
                  </section>

                  <section className="panel-control-card">
                    <div className="panel-control-row">
                      <input
                        className="panel-search-input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by title, venue, or category"
                      />
                      <div className="panel-filter-group">
                        {['all', 'pending', 'approved', 'rejected'].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`panel-filter-button${filter === item ? ' is-active' : ''}`}
                            onClick={() => setFilter(item)}
                          >
                            {item === 'all'
                              ? `All (${stats.total})`
                              : item.charAt(0).toUpperCase() + item.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {stats.rejected > 0 ? (
                    <div className="panel-banner danger">
                      {stats.rejected} {stats.rejected === 1 ? 'event was' : 'events were'} rejected.
                      Review the admin reason, update the details, and resubmit when ready.
                    </div>
                  ) : null}

                  {loading ? (
                    <section className="panel-loading">
                      <h3>Loading your society events</h3>
                      <p>Fetching the latest submissions, approval updates, and schedule changes.</p>
                    </section>
                  ) : filtered.length === 0 ? (
                    <section className="panel-empty">
                      <h3>{search ? 'No events match your search' : 'No events yet'}</h3>
                      <p>
                        {search
                          ? 'Try a broader search term or switch the current status filter.'
                          : 'Open the Create Event tab to prepare your first event submission.'}
                      </p>
                    </section>
                  ) : (
                    filtered.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onGeneratePost={setPostEvent}
                      />
                    ))
                  )}
                </>
              ) : null}

              {activeTab === 'create' ? (
                <EventForm
                  onSubmit={editData ? handleUpdate : handleCreate}
                  editData={editData}
                  onCancelEdit={() => {
                    setEditData(null);
                    setActiveTab('dashboard');
                  }}
                  existingEvents={existingEvents}
                  currentUser={user}
                />
              ) : null}

              {activeTab === 'calendar' ? <EventCalendar events={events} /> : null}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
