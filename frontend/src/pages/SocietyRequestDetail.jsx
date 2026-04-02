import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastMessage from "../components/ToastMessage";
import StatusBadge from "../components/StatusBadge";
import { getSocietyRequestById, sendEventLink } from "../api/societyApi";

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

  const renderMember = (title, member) => (
    <div className="card">
      <h3>{title}</h3>
      <p><strong>Name:</strong> {member?.name}</p>
      <p><strong>Designation:</strong> {member?.designation}</p>
      {member?.studentId && <p><strong>Student ID:</strong> {member.studentId}</p>}
      <p><strong>Email:</strong> {member?.email}</p>
      <p><strong>Phone:</strong> {member?.phone}</p>
      <p><strong>Faculty:</strong> {member?.faculty}</p>
      {member?.academicYear && <p><strong>Academic Year:</strong> {member.academicYear}</p>}
    </div>
  );

  return (
    <Layout>
      <Link to="/admin/requests" className="back-link">
        ← Back to Admin Requests
      </Link>

      <ToastMessage
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "info", message: "" })}
      />

      {loading ? (
        <LoadingSpinner />
      ) : request ? (
        <div className="stack">
          <div className="card">
            <div className="row-between">
              <h2>{request.societyName}</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {request.status === 'Approved' && (
                  <button
                    className="btn"
                    onClick={async () => {
                      const adminName = window.prompt('Enter your name (will be recorded as sender)', 'Admin');
                      if (!adminName) return;
                      try {
                        setSendingEventLink(true);
                        const res = await sendEventLink(id, adminName);
                        setRequest((prev) => ({ ...prev, eventAccessLink: res.eventAccessLink, eventAccessSentBy: adminName, eventAccessSentAt: new Date().toISOString() }));
                        setToast({ type: 'success', message: res.message || 'Event link sent' });
                      } catch (err) {
                        setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to send event link' });
                      } finally {
                        setSendingEventLink(false);
                      }
                    }}
                    disabled={sendingEventLink}
                  >
                    {sendingEventLink ? 'Sending…' : 'Send Approval Link'}
                  </button>
                )}
                <StatusBadge status={request.status} />
              </div>
            </div>

            <p><strong>Short Name:</strong> {request.shortName || "-"}</p>
            <p><strong>Category:</strong> {request.category}</p>
            <p><strong>Faculty:</strong> {request.faculty}</p>
            <p><strong>Official Email:</strong> {request.officialEmail}</p>
            <p><strong>Contact Number:</strong> {request.contactNumber}</p>
            <p><strong>Description:</strong> {request.description}</p>
            <p><strong>Objectives:</strong> {request.objectives || "-"}</p>
            <p><strong>Rejection Reason:</strong> {request.rejectionReason || "-"}</p>
          </div>

          {renderMember("Advisor", request.advisor)}
          {renderMember("President", request.president)}
          {renderMember("Secretary", request.secretary)}
          {renderMember("Treasurer", request.treasurer)}

          <div className="card">
            <h3>Event Access</h3>
            {request.eventAccessLink ? (
              <div>
                <p><strong>Link:</strong> <a href={request.eventAccessLink} target="_blank" rel="noreferrer">Open</a></p>
                <p><strong>Sent By:</strong> {request.eventAccessSentBy || '-'}</p>
                <p><strong>Sent At:</strong> {request.eventAccessSentAt ? new Date(request.eventAccessSentAt).toLocaleString() : '-'}</p>
              </div>
            ) : (
              <p>No event access link has been sent.</p>
            )}
            <hr />
            <h3>Executive Members</h3>
            {request.executiveMembers?.length ? (
              request.executiveMembers.map((member, index) => (
                <div key={index} className="executive-box">
                  <p><strong>Name:</strong> {member.name}</p>
                  <p><strong>Designation:</strong> {member.designation}</p>
                  <p><strong>Student ID:</strong> {member.studentId}</p>
                  <p><strong>Email:</strong> {member.email}</p>
                  <p><strong>Phone:</strong> {member.phone}</p>
                  <p><strong>Faculty:</strong> {member.faculty}</p>
                  <p><strong>Academic Year:</strong> {member.academicYear}</p>
                </div>
              ))
            ) : (
              <p>No executive members found.</p>
            )}
          </div>
        </div>
      ) : null}
    </Layout>
  );
}