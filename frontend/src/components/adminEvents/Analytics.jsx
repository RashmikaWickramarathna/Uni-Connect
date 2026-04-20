import React, { useEffect, useState } from "react";

import { getAnalytics } from "../../api/adminEventsApi";

const CATEGORY_COLORS = {
  Academic: "#2563eb",
  Sports: "#16a34a",
  Cultural: "#d97706",
  Social: "#db2777",
  Workshop: "#7c3aed",
  Other: "#64748b",
};

const MONTH_NAMES = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "15px" }}>Loading analytics...</div>;
  }

  if (!data) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#dc2626" }}>Failed to load analytics.</div>;
  }

  const approvalRate = data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0;
  const monthEntries = Object.entries(data.byMonth || {});
  const maxMonth = Math.max(...monthEntries.map(([, value]) => value), 1);
  const categoryEntries = Object.entries(data.byCategory || {});
  const maxCategory = Math.max(...categoryEntries.map(([, value]) => value), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Events", value: data.total, color: "#2563eb", sub: `${data.pending} pending review` },
          { label: "Approved", value: data.approved, color: "#16a34a", sub: `${approvalRate}% approval rate` },
          { label: "Rejected", value: data.rejected, color: "#dc2626", sub: `${data.total > 0 ? Math.round((data.rejected / data.total) * 100) : 0}% rejection rate` },
          { label: "Upcoming (30d)", value: data.upcoming, color: "#7c3aed", sub: "approved events" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "20px",
              boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{stat.label}</div>
            {stat.sub ? <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{stat.sub}</div> : null}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "20px", color: "#0f172a" }}>Events by Month</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "160px" }}>
            {monthEntries.map(([key, count]) => {
              const [, month] = key.split("-");
              const heightPct = (count / maxMonth) * 100;
              return (
                <div
                  key={key}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb" }}>{count > 0 ? count : ""}</span>
                  <div
                    style={{
                      width: "100%",
                      background: "linear-gradient(180deg,#3b82f6,#2563eb)",
                      borderRadius: "4px 4px 0 0",
                      height: `${heightPct}%`,
                      minHeight: count > 0 ? "4px" : "0",
                      transition: "height 0.4s ease",
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>{MONTH_NAMES[month]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "20px", color: "#0f172a" }}>Events by Category</h3>
          {categoryEntries.length === 0 ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet.</p> : null}
          {categoryEntries.map(([category, count]) => {
            const color = CATEGORY_COLORS[category] || "#64748b";
            const widthPct = (count / maxCategory) * 100;
            return (
              <div key={category} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{category}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color }}>{count}</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                  <div style={{ width: `${widthPct}%`, background: color, height: "100%", borderRadius: "4px", transition: "width 0.4s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "16px", color: "#0f172a" }}>Status Breakdown</h3>
          {[
            { label: "Pending", count: data.pending, color: "#d97706", bg: "#fffbeb" },
            { label: "Approved", count: data.approved, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Rejected", count: data.rejected, color: "#dc2626", bg: "#fef2f2" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: item.bg, borderRadius: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: item.color }}>{item.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#e2e8f0", borderRadius: "4px", height: "6px", width: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${data.total > 0 ? (item.count / data.total) * 100 : 0}%`, background: item.color, height: "100%", borderRadius: "4px" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: item.color, minWidth: "24px", textAlign: "right" }}>{item.count}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "22px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "16px", color: "#0f172a" }}>Top Societies</h3>
          {data.topSocieties.length === 0 ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet.</p> : null}
          {data.topSocieties.map((society, index) => (
            <div key={society.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: index < data.topSocieties.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{society.name}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{society.email}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "3px" }}>
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>{society.approved} approved</span>
                  <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>{society.rejected} rejected</span>
                </div>
              </div>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb" }}>{society.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
