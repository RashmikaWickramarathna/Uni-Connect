import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastMessage from "../components/ToastMessage";
import { verifyApprovalToken, registerApprovedSociety } from "../api/societyApi";

export default function SocietyRegisterByToken() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({ type: "info", message: "" });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const data = await verifyApprovalToken(token);
        setValid(data.valid);
        setRequestData(data.societyRequest);
      } catch (error) {
        setValid(false);
        setToast({
          type: "error",
          message: error?.response?.data?.message || "Invalid or expired token",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setToast({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      const data = await registerApprovedSociety({ token, password });
      setToast({
        type: "success",
        message: data.message || "Society account created successfully",
      });
      setValid(false);
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Register Approved Society</h2>
      </div>

      <ToastMessage
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "info", message: "" })}
      />

      {loading ? (
        <LoadingSpinner />
      ) : valid && requestData ? (
        <div className="stack">
          <div className="card">
            <h3>Approved Request Details</h3>
            <p><strong>Society Name:</strong> {requestData.societyName}</p>
            <p><strong>Email:</strong> {requestData.officialEmail}</p>
            <p><strong>Category:</strong> {requestData.category}</p>
            <p><strong>Faculty:</strong> {requestData.faculty}</p>
          </div>

          <form onSubmit={handleRegister} className="card stack">
            <h3>Create Account Password</h3>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn primary">
              Register Society
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <p>This token is not valid anymore.</p>
        </div>
      )}
    </Layout>
  );
}