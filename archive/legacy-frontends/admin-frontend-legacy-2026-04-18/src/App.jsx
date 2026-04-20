import React, { useEffect, useState } from 'react';
import AdminCalendar from './components/AdminCalendar';
import AdminEventCard from './components/AdminEventCard';
import Analytics from './components/Analytics';
import ReasonModal from './components/ReasonModal';
import Reminders from './components/Reminders';
import { approveEvent, deleteEvent, getAllEvents, rejectEvent } from './api';
import './dashboardTheme.css';

const safeText = value => String(value ?? '');

const normalizeStatus = status => {
  const normalized = safeText(status).toLowerCase();
  if (normalized === 'published') return 'approved';
  if (normalized === 'draft') return 'pending';
  return normalized || 'pending';
};

const normalizeEvent = event => ({
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

const TABS = [
  { key: 'dashboard', label: 'Events', note: 'Review queue', short: 'EV' },
  { key: 'analytics', label: 'Analytics', note: 'Trends and totals', short: 'AN' },
  { key: 'reminders', label: 'Reminders', note: 'Email timeline', short: 'RM' },
  { key: 'calendar', label: 'Calendar', note: 'Schedule view', short: 'CL' },
];

function SidebarNavItem({ active, badge, label, note, short, onClick }) {
  return (
    <button type="button" className={`panel-nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="panel-nav-icon">{short}</span>
      <span className="panel-nav-copy">
        <strong>{label}</strong>
        <span>{note}</span>
      </span>
      {badge > 0 ? <span className="panel-nav-badge">{badge}</span> : null}
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

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getAllEvents();
      setEvents((response.data || []).map(normalizeEvent));
    } catch {
      showToast('Failed to load events.', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const handleFocus = () => {
      fetchEvents(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await approveEvent(id);
      setEvents(previous =>
        previous.map(event => (event._id === id ? normalizeEvent(response.data) : event))
      );
      showToast('Event approved and the society has been notified.');
    } catch (err) {
      showToast(err.response?.data?.errors?.[0] || 'Failed to approve the event.', 'error');
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const response = await rejectEvent(rejectModal._id, reason);
      setEvents(previous =>
        previous.map(event =>
          event._id === rejectModal._id ? normalizeEvent(response.data) : event
        )
      );
      showToast('Event rejected and the society received your reason.', 'warning');
    } catch (err) {
      showToast(err.response?.data?.errors?.[0] || 'Failed to reject the event.', 'error');
    } finally {
      setRejectModal(null);
    }
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      await deleteEvent(deleteModal._id, reason);
      setEvents(previous => previous.filter(event => event._id !== deleteModal._id));
      showToast('Event deleted and the society has been notified.', 'warning');
    } catch (err) {
      showToast(err.response?.data?.errors?.[0] || 'Failed to delete the event.', 'error');
    } finally {
      setDeleteModal(null);
    }
  };

  const stats = {
    total: events.length,
    pending: events.filter(event => event.status === 'pending').length,
    approved: events.filter(event => event.status === 'approved').length,
    rejected: events.filter(event => event.status === 'rejected').length,
  };

  let filtered = filter === 'all' ? events : events.filter(event => event.status === filter);
  if (search.trim()) {
    const searchValue = search.toLowerCase();
    filtered = filtered.filter(event =>
      safeText(event.title).toLowerCase().includes(searchValue) ||
      safeText(event.organizer).toLowerCase().includes(searchValue) ||
      safeText(event.venue).toLowerCase().includes(searchValue) ||
      safeText(event.organizerEmail).toLowerCase().includes(searchValue)
    );
  }

  const spotlightStats = [
    { label: 'Awaiting Review', value: stats.pending, accent: '#f59e0b' },
    { label: 'Approved', value: stats.approved, accent: '#10b981' },
    { label: 'Rejected', value: stats.rejected, accent: '#ef4444' },
  ];

  const statCards = [
    {
      label: 'Total Events',
      note: 'Every submission in the moderation pipeline.',
      value: stats.total,
      accent: '#2563eb',
      soft: 'rgba(37, 99, 235, 0.12)',
      short: 'ALL',
      filterValue: 'all',
    },
    {
      label: 'Pending Review',
      note: 'Items still waiting for an admin decision.',
      value: stats.pending,
      accent: '#f59e0b',
      soft: 'rgba(245, 158, 11, 0.16)',
      short: 'PEN',
      filterValue: 'pending',
    },
    {
      label: 'Approved',
      note: 'Confirmed events already released to societies.',
      value: stats.approved,
      accent: '#10b981',
      soft: 'rgba(16, 185, 129, 0.14)',
      short: 'APP',
      filterValue: 'approved',
    },
    {
      label: 'Rejected',
      note: 'Entries that still need society-side changes.',
      value: stats.rejected,
      accent: '#ef4444',
      soft: 'rgba(239, 68, 68, 0.14)',
      short: 'REJ',
      filterValue: 'rejected',
    },
  ];

  return (
    <div className="panel-shell">
      {toast ? <div className={`panel-toast ${toast.type || 'success'}`}>{toast.msg}</div> : null}

      {rejectModal ? (
        <ReasonModal
          type="reject"
          eventTitle={rejectModal.title}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectModal(null)}
        />
      ) : null}

      {deleteModal ? (
        <ReasonModal
          type="delete"
          eventTitle={deleteModal.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal(null)}
        />
      ) : null}

      <aside className="panel-sidebar">
        <div className="panel-brand">
          <div className="panel-brand-mark">UC</div>
          <div className="panel-brand-copy">
            <div className="panel-brand-title">Uni-Connect</div>
            <div className="panel-brand-sub">Admin event panel</div>
          </div>
        </div>

        <nav className="panel-nav" aria-label="Admin navigation">
          {TABS.map(tab => (
            <SidebarNavItem
              key={tab.key}
              active={activeTab === tab.key}
              badge={tab.key === 'dashboard' ? stats.pending : 0}
              label={tab.label}
              note={tab.note}
              short={tab.short}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </nav>

       
      </aside>

      <div className="panel-main">
        <main className="panel-content">
          {activeTab === 'dashboard' ? (
            <>
              <section className="panel-spotlight">
                <div className="panel-spotlight-copy">
                  <p className="panel-kicker">Moderation focus</p>
                  <h2>Review event submissions in the same shell used across the rest of Uni-Connect.</h2>
                  <p>
                    The admin panel now follows the shared product styling, so approvals, rejections,
                    and schedule reviews feel consistent with the main application.
                  </p>
                </div>

                <div className="panel-spotlight-stats">
                  {spotlightStats.map(item => (
                    <div key={item.label} className="panel-spotlight-stat">
                      <strong style={{ color: item.accent }}>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel-stat-grid">
                {statCards.map(card => (
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
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search by title, society, venue, or organizer email"
                  />
                  <div className="panel-filter-group">
                    {['all', 'pending', 'approved', 'rejected'].map(item => (
                      <button
                        key={item}
                        type="button"
                        className={`panel-filter-button${filter === item ? ' is-active' : ''}`}
                        onClick={() => setFilter(item)}
                      >
                        {item === 'all' ? `All (${stats.total})` : item.charAt(0).toUpperCase() + item.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {stats.pending > 0 && filter === 'all' ? (
                <div className="panel-banner warning">
                  {stats.pending} {stats.pending === 1 ? 'event is' : 'events are'} waiting for your decision.
                  Approve or reject with a reason and the society will be notified automatically.
                </div>
              ) : null}

              {loading ? (
                <section className="panel-loading">
                  <h3>Loading event queue</h3>
                  <p>Fetching the latest submissions and moderation state for the admin panel.</p>
                </section>
              ) : filtered.length === 0 ? (
                <section className="panel-empty">
                  <h3>{search ? 'No events match your search' : 'Nothing to review right now'}</h3>
                  <p>
                    {search
                      ? 'Try a broader search term or switch the filter state to see more events.'
                      : 'When societies create or update events, they will appear here for review.'}
                  </p>
                </section>
              ) : (
                filtered.map(event => (
                  <AdminEventCard
                    key={event._id}
                    event={event}
                    onApprove={handleApprove}
                    onReject={setRejectModal}
                    onDelete={setDeleteModal}
                    onEdit={() => {}}
                  />
                ))
              )}
            </>
          ) : null}

          {activeTab === 'analytics' ? <Analytics /> : null}
          {activeTab === 'reminders' ? <Reminders events={events} /> : null}
          {activeTab === 'calendar' ? <AdminCalendar events={events} /> : null}
        </main>
      </div>
    </div>
  );
}
