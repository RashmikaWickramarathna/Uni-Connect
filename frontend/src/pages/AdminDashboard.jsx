import AdminLayout from "../components/AdminLayout";
import { useState } from "react";

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

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

export default function AdminDashboard() {
  const [module] = useState("Dashboard");

  return (
    <AdminLayout>
      {({ selectedModule }) => (
        <div className="dashboard-root">
          <div className="dashboard-actions">
            <div className="stats-grid">
              <StatCard icon="🏛️" label="Total Societies" value={42} />
              <StatCard icon="⏳" label="Pending Approvals" value={7} />
              <StatCard icon="✅" label="Approved Societies" value={25} />
              <StatCard icon="🎫" label="Active Events" value={12} />
              <StatCard icon="🧾" label="Total Reservations" value={128} />
              <StatCard icon="💳" label="Verified Payments" value={99} />
              <StatCard icon="✉️" label="Feedback Count" value={21} />
            </div>

            <div className="small-cards-grid">
              <SmallStatCard label="Pending" value={7} color="#f59e0b" icon="⏳" />
              <SmallStatCard label="Approved" value={25} color="#10b981" icon="✅" />
              <SmallStatCard label="Rejected" value={3} color="#ef4444" icon="✖️" />
            </div>

            <div className="module-actions">
              <div className="actions-info">Module: <strong>{selectedModule}</strong></div>
              <div className="actions-row">
                {selectedModule === "Society Approvals" && (
                  <>
                    <button className="btn primary">View Applications</button>
                    <button className="btn">Approve Society</button>
                    <button className="btn danger">Reject Society</button>
                  </>
                )}

                {selectedModule === "Events" && (
                  <>
                    <button className="btn primary">Create Event</button>
                    <button className="btn">Manage Events</button>
                    <button className="btn">Publish Event</button>
                  </>
                )}

                {selectedModule === "Ticket Reservations" && (
                  <>
                    <button className="btn primary">View Reservations</button>
                    <button className="btn">Validate Payments</button>
                    <button className="btn">Download Reports</button>
                  </>
                )}

                {selectedModule === "User Accounts" && (
                  <>
                    <button className="btn primary">Manage Users</button>
                    <button className="btn">View Feedback</button>
                    <button className="btn danger">Disable Account</button>
                  </>
                )}

                {selectedModule === "Dashboard" && (
                  <>
                    <button className="btn primary">Refresh Stats</button>
                    <button className="btn">Export CSV</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            {selectedModule === "Society Approvals" ? (
              <div className="card-grid">
                {/* example society cards */}
                {[1, 2, 3].map((i) => (
                  <div className="soc-card" key={i}>
                    <div className="soc-header">
                      <h3>Example Society {i}</h3>
                      <div className="badge pending">Pending</div>
                    </div>
                    <div className="soc-body">
                      <div><strong>President:</strong> John Doe</div>
                      <div><strong>Email:</strong> jd{i}@example.edu</div>
                      <div><strong>Category:</strong> Cultural</div>
                      <div><strong>Submitted:</strong> 2026-03-01</div>
                    </div>
                    <div className="soc-actions">
                      <button className="btn">View</button>
                      <button className="btn primary">Approve</button>
                      <button className="btn danger">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedModule === "Events" ? (
              <div className="card-grid">
                {[1, 2].map((i) => (
                  <div className="event-card" key={i}>
                    <div className="event-header">
                      <h3>Campus Music Night {i}</h3>
                      <div className="badge upcoming">Upcoming</div>
                    </div>
                    <div className="event-body">
                      <div><strong>Date:</strong> 2026-04-10</div>
                      <div><strong>Venue:</strong> Main Hall</div>
                      <div><strong>Organizer:</strong> Music Society</div>
                      <div><strong>Tickets:</strong> 250</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedModule === "Ticket Reservations" ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reservation ID</th>
                      <th>Event Name</th>
                      <th>Student Name</th>
                      <th>Payment Status</th>
                      <th>Ticket Count</th>
                      <th>Validation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>RES-001</td>
                      <td>Campus Music Night</td>
                      <td>Alice Smith</td>
                      <td>Paid</td>
                      <td>2</td>
                      <td>Validated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="welcome-card">
                <h3>Welcome to Uni-Connect Admin</h3>
                <p>Select a module from the left to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

