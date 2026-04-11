import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import ToastMessage from "../components/ToastMessage";
import { getSocietyRequestById, sendEventLink } from "../api/societyApi";

function MemberCard({ title, member }) {
  return (
    <div className="member-card">
      <h3>{title}</h3>
      <p><strong>Name:</strong> {member?.name || "-"}</p>
      <p><strong>Designation:</strong> {member?.designation || "-"}</p>
      {member?.studentId && <p><strong>Student ID:</strong> {member.studentId}</p>}
      <p><strong>Email:</strong> {member?.email || "-"}</p>
      <p><strong>Phone:</strong> {member?.phone || "-"}</p>
      <p><strong>Faculty:</strong> {member?.faculty || "-"}</p>
      {member?.academicYear && <p><strong>Academic Year:</strong> {member.academicYear}</p>}
    </div>
  );
}

export default function SocietyRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: "info", message: "" });
  const [sendingEventLink, setSendingEventLink] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const data = await getSocietyRequestById(id);
        setRequest(data);
      } catch (error) {
        setToast({
          type: "error",
          message: error?.response?.data?.message || "Failed to fetch request details",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  const handleSendEventLink = async () => {
    const adminName = window.prompt("Enter your name (will be recorded as sender)", "Admin");
    if (!adminName) return;

    try {
      setSendingEventLink(true);
      const response = await sendEventLink(id, adminName);
      setRequest((current) => ({
        ...current,
        eventAccessLink: response.eventAccessLink,
        eventAccessSentBy: response.eventAccessSentBy || adminName,
        eventAccessSentAt: response.eventAccessSentAt || new Date().toISOString(),
      }));
      setToast({ type: "success", message: response.message || "Event link sent successfully." });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to send the event access link",
      });
    } finally {
      setSendingEventLink(false);
    }
  };

  return (
    <AdminLayout>
      <ToastMessage
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "info", message: "" })}
      />

      {loading ? (
        <div className="empty-state-panel">
          <LoadingSpinner />
        </div>
      ) : request ? (
        <>
          <div className="page-header split">
            <div>
              <h2>Society Request Detail</h2>
              <p>Review the complete application, officer details, and event-link access for this society.</p>
            </div>

            <div className="page-actions">
              <Link to="/society-admin/requests" className="btn">
                Back to Requests
              </Link>

              {request.status === "Approved" && (
                <button className="btn primary" type="button" onClick={handleSendEventLink} disabled={sendingEventLink}>
                  {sendingEventLink ? "Sending..." : "Send Event Link"}
                </button>
              )}
            </div>
          </div>

          <div className="detail-grid">
            <section className="detail-panel detail-panel-wide">
              <div className="detail-panel-header">
                <div>
                  <h3 className="detail-panel-title">{request.societyName}</h3>
                  <p className="section-sub">Review the submitted registration information and current approval state.</p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="detail-meta-grid">
                <div className="detail-item">
                  <strong>Short Name</strong>
                  <span>{request.shortName || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Category</strong>
                  <span>{request.category || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Faculty</strong>
                  <span>{request.faculty || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Official Email</strong>
                  <span>{request.officialEmail || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Contact Number</strong>
                  <span>{request.contactNumber || "-"}</span>
                </div>
                <div className="detail-item">
                  <strong>Rejection Reason</strong>
                  <span>{request.rejectionReason || "-"}</span>
                </div>
                <div className="detail-item detail-panel-wide">
                  <strong>Description</strong>
                  <p>{request.description || "-"}</p>
                </div>
                <div className="detail-item detail-panel-wide">
                  <strong>Objectives</strong>
                  <p>{request.objectives || "-"}</p>
                </div>
              </div>
            </section>

            <section className="detail-panel">
              <div className="detail-panel-header">
                <h3 className="detail-panel-title">Event Access</h3>
              </div>

              {request.eventAccessLink ? (
                <div className="detail-meta-grid">
                  <div className="detail-item">
                    <strong>Link</strong>
                    <a className="inline-link" href={request.eventAccessLink} target="_blank" rel="noreferrer">
                      Open Event Access
                    </a>
                  </div>
                  <div className="detail-item">
                    <strong>Sent By</strong>
                    <span>{request.eventAccessSentBy || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Sent At</strong>
                    <span>{request.eventAccessSentAt ? new Date(request.eventAccessSentAt).toLocaleString() : "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="section-sub">No event access link has been sent for this society yet.</p>
              )}
            </section>

            <section className="detail-panel">
              <div className="detail-panel-header">
                <h3 className="detail-panel-title">Primary Officers</h3>
              </div>

              <div className="member-grid">
                <MemberCard title="Advisor" member={request.advisor} />
                <MemberCard title="President" member={request.president} />
                <MemberCard title="Secretary" member={request.secretary} />
                <MemberCard title="Treasurer" member={request.treasurer} />
              </div>
            </section>

            <section className="detail-panel detail-panel-wide">
              <div className="detail-panel-header">
                <h3 className="detail-panel-title">Executive Members</h3>
              </div>

              {request.executiveMembers?.length ? (
                <div className="member-grid">
                  {request.executiveMembers.map((member, index) => (
                    <MemberCard
                      key={`${member.email || member.studentId || "member"}-${index}`}
                      title={member.designation || `Executive Member ${index + 1}`}
                      member={member}
                    />
                  ))}
                </div>
              ) : (
                <p className="section-sub">No executive members were submitted for this request.</p>
              )}
            </section>
          </div>
        </>
      ) : (
        <div className="empty-state-panel">No request details were found for this society.</div>
      )}
    </AdminLayout>
  );
}
