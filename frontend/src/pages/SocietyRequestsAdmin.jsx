import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function SmallStatCard({ label, value, color, icon }) {
  return (
    <div className="small-stat-card">
      <div className="small-accent" style={{ background: color }} />
      <div className="small-body">
        <div className="small-icon" style={{ background: color }}>{icon}</div>
        <div className="small-text">
          <div className="small-value">{value}</div>
          <div className="small-label">{label}</div>
        </div>
      </div>
    </div>
  );
}
import LoadingSpinner from "../components/LoadingSpinner";
import ToastMessage from "../components/ToastMessage";
import StatusBadge from "../components/StatusBadge";
import { getAllSocietyRequests, approveSocietyRequest, rejectSocietyRequest } from "../api/societyApi";

export default function SocietyRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: "info", message: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllSocietyRequests();
      setRequests(data);
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to fetch requests",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    const ok = window.confirm("Are you sure you want to approve this society?");
    if (!ok) return;

    try {
      const data = await approveSocietyRequest(id);
      // update local copy to reflect approved status
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "Approved" } : r)));
      setToast({
        type: "success",
        message: data?.message || "Society approved successfully.",
      });
    } catch (error) {
      // If backend returns success but with warning about email, show pending message
      const msg = error?.response?.data?.message;
      if (msg && /email/i.test(msg)) {
        setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "Approved" } : r)));
        setToast({ type: "info", message: "Society approved. Email notification pending." });
      } else {
        setToast({ type: "error", message: msg || "Approval failed" });
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;

    try {
      const data = await rejectSocietyRequest(id, reason);
      setToast({
        type: "success",
        message: data.message || "Rejected successfully",
      });
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "Rejected" } : r)));
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Rejection failed",
      });
    }
  };

  // Manual approval link creation removed — approval is automatic via Approve

  return (
    <AdminLayout>
      {() => (
        <>
          <div className="page-header">
            <h2>Admin - Society Requests</h2>
            <p>Manage all submitted society registration requests.</p>
          </div>

          <div className="small-cards-grid" style={{ marginTop: 12 }}>
            <SmallStatCard label="Pending" value={requests.filter(r => (r.status||'').toLowerCase() === 'pending').length} color="#f59e0b" icon="⏳" />
            <SmallStatCard label="Approved" value={requests.filter(r => (r.status||'').toLowerCase() === 'approved').length} color="#10b981" icon="✅" />
            <SmallStatCard label="Rejected" value={requests.filter(r => (r.status||'').toLowerCase() === 'rejected').length} color="#ef4444" icon="✖️" />
          </div>

          {toast.type === 'error' && (
            <div className="error-banner">
              <div className="error-text">{toast.message || 'Failed to fetch society requests'}</div>
              <div className="error-actions">
                <button className="btn" onClick={() => { setToast({ type: 'info', message: '' }); loadRequests(); }}>Retry</button>
                <button className="btn" onClick={() => setToast({ type: 'info', message: '' })}>Dismiss</button>
              </div>
            </div>
          )}

          <ToastMessage
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ type: "info", message: "" })}
          />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="search-filter-row">
                    <input
                      className="search-input"
                      placeholder="Search by society name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Pending</option>
                      <option>Approval Link Sent</option>
                      <option>Registered</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>

                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Society Name</th>
                          <th>Category</th>
                          <th>Faculty</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {requests.filter((r) => {
                          const q = search.trim().toLowerCase();
                          if (q) {
                            if (!(`${r.societyName}`.toLowerCase().includes(q) || `${r.officialEmail}`.toLowerCase().includes(q))) return false;
                          }
                          if (statusFilter && statusFilter !== "All") {
                            return (r.status || "").toLowerCase() === statusFilter.toLowerCase();
                          }
                          return true;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-cell">No requests found.</td>
                          </tr>
                        ) : (
                          requests
                            .filter((r) => {
                              const q = search.trim().toLowerCase();
                              if (q) {
                                if (!(`${r.societyName}`.toLowerCase().includes(q) || `${r.officialEmail}`.toLowerCase().includes(q))) return false;
                              }
                              if (statusFilter && statusFilter !== "All") {
                                return (r.status || "").toLowerCase() === statusFilter.toLowerCase();
                              }
                              return true;
                            })
                            .map((request) => {
                              const status = (request.status || "").trim();
                              return (
                                <tr key={request._id}>
                                  <td>{request.societyName}</td>
                                  <td>{request.category}</td>
                                  <td>{request.faculty}</td>
                                  <td>{request.officialEmail}</td>
                                  <td>
                                    <StatusBadge status={status} />
                                  </td>
                                  <td className="actions">
                                    {/* Action button logic based on status */}
                                    {status === "Pending" && (
                                      <>
                                        <Link to={`/society-admin/requests/${request._id}`} className="btn small view">View</Link>
                                        <button onClick={() => handleApprove(request._id)} className="btn small primary">Approve</button>
                                        <button onClick={() => handleReject(request._id)} className="btn small danger">Reject</button>
                                      </>
                                    )}

                                    {status === "Approval Link Sent" && (
                                      <Link to={`/society-admin/requests/${request._id}`} className="btn small view">View</Link>
                                    )}

                                    {status === "Registered" && (
                                      <Link to={`/society-admin/requests/${request._id}`} className="btn small view">View</Link>
                                    )}

                                    {status === "Approved" && (
                                      <Link to={`/society-admin/requests/${request._id}`} className="btn small view">View</Link>
                                    )}

                                    {status === "Rejected" && (
                                      <Link to={`/society-admin/requests/${request._id}`} className="btn small view">View</Link>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
        </>
      )}
    </AdminLayout>
  );
}
