import React from "react";

import AdminLayout from "../../components/AdminLayout";

const EVENT_PANEL_URL = import.meta.env.VITE_EVENT_ADMIN_URL || "http://localhost:3001";

export default function Events() {
  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Admin - Event Management</h2>
        <p>Review and manage event submissions inside the Uni-Connect admin workspace.</p>
      </div>

      <div className="embedded-panel">
        <iframe
          className="embedded-panel-frame"
          src={EVENT_PANEL_URL}
          title="Event Management Admin Panel"
          loading="lazy"
        />
      </div>
    </AdminLayout>
  );
}
