import { useState } from "react";
import Layout from "../components/Layout";
import MemberFields from "../components/MemberFields";
import ToastMessage from "../components/ToastMessage";
import { initialFormData, emptyMember } from "../utils/initialFormData";
import { submitSocietyRequest } from "../api/societyApi";

export default function SocietyRequestSubmit() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "info", message: "" });

  const handleRootChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleExecutiveChange = (index, field, value) => {
    const updated = [...formData.executiveMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, executiveMembers: updated }));
  };

  const addExecutiveMember = () => {
    setFormData((prev) => ({
      ...prev,
      executiveMembers: [...prev.executiveMembers, { ...emptyMember }],
    }));
  };

  const removeExecutiveMember = (index) => {
    if (formData.executiveMembers.length <= 3) {
      setToast({
        type: "error",
        message: "At least 3 executive members are required.",
      });
      return;
    }

    const updated = formData.executiveMembers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, executiveMembers: updated }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await submitSocietyRequest(formData);
      setToast({ type: "success", message: data.message || "Submitted successfully" });
      resetForm();
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to submit request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Society Registration Request</h2>
        <p>Fill in all required information and submit your society request.</p>
      </div>

      <ToastMessage
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "info", message: "" })}
      />

      <form onSubmit={handleSubmit} className="stack">
        <div className="card">
          <h3>Basic Information</h3>
          <div className="grid two">
            <input
              type="text"
              placeholder="Society Name"
              value={formData.societyName}
              onChange={(e) => handleRootChange("societyName", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Short Name"
              value={formData.shortName}
              onChange={(e) => handleRootChange("shortName", e.target.value)}
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => handleRootChange("category", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Faculty"
              value={formData.faculty}
              onChange={(e) => handleRootChange("faculty", e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Official Email"
              value={formData.officialEmail}
              onChange={(e) => handleRootChange("officialEmail", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={(e) => handleRootChange("contactNumber", e.target.value)}
              required
            />
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleRootChange("description", e.target.value)}
            required
          />

          <textarea
            placeholder="Objectives"
            value={formData.objectives}
            onChange={(e) => handleRootChange("objectives", e.target.value)}
          />
        </div>

        <MemberFields
          title="Advisor Information"
          data={formData.advisor}
          onChange={handleNestedChange}
          prefix="advisor"
          isAdvisor
        />

        <MemberFields
          title="President Information"
          data={formData.president}
          onChange={handleNestedChange}
          prefix="president"
        />

        <MemberFields
          title="Secretary Information"
          data={formData.secretary}
          onChange={handleNestedChange}
          prefix="secretary"
        />

        <MemberFields
          title="Treasurer Information"
          data={formData.treasurer}
          onChange={handleNestedChange}
          prefix="treasurer"
        />

        <div className="card">
          <div className="row-between">
            <h3>Executive Members</h3>
            <button type="button" onClick={addExecutiveMember} className="btn secondary">
              Add Member
            </button>
          </div>

          {formData.executiveMembers.map((member, index) => (
            <div key={index} className="executive-box">
              <div className="row-between">
                <h4>Executive Member {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeExecutiveMember(index)}
                  className="btn danger"
                >
                  Remove
                </button>
              </div>

              <div className="grid two">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleExecutiveChange(index, "name", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Student ID"
                  value={member.studentId}
                  onChange={(e) => handleExecutiveChange(index, "studentId", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={member.designation}
                  onChange={(e) => handleExecutiveChange(index, "designation", e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={member.email}
                  onChange={(e) => handleExecutiveChange(index, "email", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={member.phone}
                  onChange={(e) => handleExecutiveChange(index, "phone", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Faculty"
                  value={member.faculty}
                  onChange={(e) => handleExecutiveChange(index, "faculty", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Academic Year"
                  value={member.academicYear}
                  onChange={(e) =>
                    handleExecutiveChange(index, "academicYear", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
  <button type="submit" className="btn primary" disabled={loading}>
    {loading ? "Submitting..." : "Submit Request"}
  </button>
</div>
      </form>
    </Layout>
  );
}