import { useState } from "react";
import Layout from "../components/Layout";
import MemberFields from "../components/MemberFields";
import ToastMessage from "../components/ToastMessage";
import { initialFormData, emptyMember } from "../utils/initialFormData";
import { submitSocietyRequest } from "../api/societyApi";
import {
  validateField,
  validateAll,
  facultyOptions,
  categoryOptions,
  academicYearOptions,
  getPhoneValidationProps,
  getNameValidationProps,
  getDesignationValidationProps,
} from "../utils/validation";

export default function SocietyRequestSubmit() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "info", message: "" });
  const [errors, setErrors] = useState({});

  const setFieldError = (key, message) => {
    setErrors((prev) => {
      if (!message) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: message };
    });
  };

  const handleRootChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const err = validateField(next, field);
      setFieldError(field, err);
      return next;
    });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => {
      const updatedSection = { ...prev[section], [field]: value };
      const next = { ...prev, [section]: updatedSection };
      const key = `${section}.${field}`;
      const err = validateField(next, key);
      setFieldError(key, err);
      return next;
    });
  };

  const handleExecutiveChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.executiveMembers];
      updated[index] = { ...updated[index], [field]: value };
      const next = { ...prev, executiveMembers: updated };
      const key = `executiveMembers.${index}.${field}`;
      const err = validateField(next, key);
      setFieldError(key, err);
      return next;
    });
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

    // Validate all fields before submission
    const validationErrors = validateAll(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error field (optional)
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
      }
      return;
    }

    setLoading(true);

    try {
      // If a file is attached, send multipart/form-data with the file under 'signatureLetter'
      let payload;
      if (formData.signatureLetter && formData.signatureLetter.letterFile) {
        const fd = new FormData();
        fd.append("signatureLetter", formData.signatureLetter.letterFile);

        // copy formData and remove the actual File object before stringifying
        const copy = { ...formData };
        if (copy.signatureLetter) {
          const sigCopy = { ...copy.signatureLetter };
          delete sigCopy.letterFile;
          copy.signatureLetter = sigCopy;
        }

        fd.append("payload", JSON.stringify(copy));
        payload = fd;
      } else {
        payload = formData;
      }

      const data = await submitSocietyRequest(payload);
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
            <div>
              <input
                type="text"
                placeholder="Society Name"
                value={formData.societyName}
                onChange={(e) => handleRootChange("societyName", e.target.value)}
                {...getNameValidationProps()}
                required
                data-field="societyName"
                className={errors['societyName'] ? 'invalid' : ''}
              />
              {errors['societyName'] && <div className="error-message">{errors['societyName']}</div>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Short Name"
                value={formData.shortName}
                onChange={(e) => handleRootChange("shortName", e.target.value)}
                data-field="shortName"
                className={errors['shortName'] ? 'invalid' : ''}
              />
              {errors['shortName'] && <div className="error-message">{errors['shortName']}</div>}
            </div>

            <div>
              <select
                value={formData.category}
                onChange={(e) => handleRootChange("category", e.target.value)}
                required
                data-field="category"
                className={errors['category'] ? 'invalid' : ''}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors['category'] && <div className="error-message">{errors['category']}</div>}
            </div>

            <div>
              <select
                value={formData.faculty}
                onChange={(e) => handleRootChange("faculty", e.target.value)}
                required
                data-field="faculty"
                className={errors['faculty'] ? 'invalid' : ''}
              >
                <option value="">Select Faculty</option>
                {facultyOptions.map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
              {errors['faculty'] && <div className="error-message">{errors['faculty']}</div>}
            </div>

            <div>
              <input
                type="email"
                placeholder="Official Email"
                value={formData.officialEmail}
                onChange={(e) => handleRootChange("officialEmail", e.target.value)}
                required
                data-field="officialEmail"
                className={errors['officialEmail'] ? 'invalid' : ''}
              />
              {errors['officialEmail'] && <div className="error-message">{errors['officialEmail']}</div>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Contact Number (10 digits)"
                value={formData.contactNumber}
                onChange={(e) => handleRootChange("contactNumber", e.target.value)}
                {...getPhoneValidationProps()}
                required
                data-field="contactNumber"
                className={errors['contactNumber'] ? 'invalid' : ''}
              />
              {errors['contactNumber'] && <div className="error-message">{errors['contactNumber']}</div>}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleRootChange("description", e.target.value)}
              required
              data-field="description"
              className={errors['description'] ? 'invalid' : ''}
            />
            {errors['description'] && <div className="error-message">{errors['description']}</div>}
          </div>

          <div>
            <textarea
              placeholder="Objectives"
              value={formData.objectives}
              onChange={(e) => handleRootChange("objectives", e.target.value)}
              data-field="objectives"
              className={errors['objectives'] ? 'invalid' : ''}
            />
            {errors['objectives'] && <div className="error-message">{errors['objectives']}</div>}
          </div>
        </div>

        <MemberFields
          title="Advisor Information"
          data={formData.advisor}
          onChange={handleNestedChange}
          prefix="advisor"
          isAdvisor
          errors={errors}
        />

        <MemberFields
          title="President Information"
          data={formData.president}
          onChange={handleNestedChange}
          prefix="president"
          errors={errors}
        />

        <MemberFields
          title="Vice President Information"
          data={formData.vicePresident}
          onChange={handleNestedChange}
          prefix="vicePresident"
          errors={errors}
        />

        <MemberFields
          title="Secretary Information"
          data={formData.secretary}
          onChange={handleNestedChange}
          prefix="secretary"
          errors={errors}
        />

        <MemberFields
          title="Treasurer Information"
          data={formData.treasurer}
          onChange={handleNestedChange}
          prefix="treasurer"
          errors={errors}
        />

        <div className="card">
          <h3>Bank Account Information</h3>
          <p className="section-note">Society/Club must have a bank account in their official name</p>
          <div className="grid two">
            <div>
              <input
                type="text"
                placeholder="Account Holder Name (Society Official Name)"
                value={formData.bankAccount.accountHolderName}
                onChange={(e) => handleNestedChange("bankAccount", "accountHolderName", e.target.value)}
                {...getNameValidationProps()}
                required
                data-field="bankAccount.accountHolderName"
                className={errors['bankAccount.accountHolderName'] ? 'invalid' : ''}
              />
              {errors['bankAccount.accountHolderName'] && <div className="error-message">{errors['bankAccount.accountHolderName']}</div>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Account Number"
                value={formData.bankAccount.accountNumber}
                onChange={(e) => handleNestedChange("bankAccount", "accountNumber", e.target.value)}
                required
                data-field="bankAccount.accountNumber"
                className={errors['bankAccount.accountNumber'] ? 'invalid' : ''}
              />
              {errors['bankAccount.accountNumber'] && <div className="error-message">{errors['bankAccount.accountNumber']}</div>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Bank Name"
                value={formData.bankAccount.bankName}
                onChange={(e) => handleNestedChange("bankAccount", "bankName", e.target.value)}
                required
                data-field="bankAccount.bankName"
                className={errors['bankAccount.bankName'] ? 'invalid' : ''}
              />
              {errors['bankAccount.bankName'] && <div className="error-message">{errors['bankAccount.bankName']}</div>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Branch Name"
                value={formData.bankAccount.branchName}
                onChange={(e) => handleNestedChange("bankAccount", "branchName", e.target.value)}
                required
                data-field="bankAccount.branchName"
                className={errors['bankAccount.branchName'] ? 'invalid' : ''}
              />
              {errors['bankAccount.branchName'] && <div className="error-message">{errors['bankAccount.branchName']}</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Signature Letter</h3>
          <p className="section-note">Submit a letter with signatures from the following officers:</p>
          <div className="signature-checklist">
            <label className={`checkbox-label ${errors['signatureLetter.presidentSigned'] ? 'invalid' : ''}`}>
              <input
                type="checkbox"
                checked={formData.signatureLetter.presidentSigned}
                onChange={(e) => handleNestedChange("signatureLetter", "presidentSigned", e.target.checked)}
                data-field="signatureLetter.presidentSigned"
              />

              <p>I/We hereby confirm that the society has read, understood, and agreed to all terms and conditions, rules, and regulations 
                of the university regarding society registration and operation.</p>
            </label>
            {errors['signatureLetter.presidentSigned'] && <div className="error-message">{errors['signatureLetter.presidentSigned']}</div>}
          </div>

          <div style={{ marginBottom: 8 }}>
            <a href="/signature_letter_template.pdf" download className="btn secondary">Download Letter Template</a>
          </div>

          <div className={`file-upload ${errors['signatureLetter.letterFile'] ? 'invalid' : ''}`}>
            <label htmlFor="signature-letter">Upload Signature Letter (PDF/Image):</label>
            <input
              type="file"
              id="signature-letter"
              accept=".pdf,.jpg,.jpeg,.png"
              data-field="signatureLetter.letterFile"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleNestedChange("signatureLetter", "letterFile", file);
                  const err = validateField({ ...formData, signatureLetter: { ...formData.signatureLetter, letterFile: file } }, 'signatureLetter.letterFile');
                  setFieldError('signatureLetter.letterFile', err);
                } else {
                  handleNestedChange("signatureLetter", "letterFile", null);
                  setFieldError('signatureLetter.letterFile', null);
                }
              }}
            />
            {errors['signatureLetter.letterFile'] && <div className="error-message">{errors['signatureLetter.letterFile']}</div>}
          </div>
        </div>

        <div className="card">
          <div className="row-between">
            <h3>Executive Members</h3>
            <button type="button" onClick={addExecutiveMember} className="btn secondary">
              Add Member
            </button>
          </div>
          {errors['executiveMembers'] && <div className="error-message">{errors['executiveMembers']}</div>}

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
                <div>
                  <input
                    type="text"
                    placeholder="Name (letters only)"
                    value={member.name}
                    onChange={(e) => handleExecutiveChange(index, "name", e.target.value)}
                    {...getNameValidationProps()}
                    required
                    data-field={`executiveMembers.${index}.name`}
                    className={errors[`executiveMembers.${index}.name`] ? 'invalid' : ''}
                  />
                  {errors[`executiveMembers.${index}.name`] && <div className="error-message">{errors[`executiveMembers.${index}.name`]}</div>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Student ID (e.g., IT123456)"
                    value={member.studentId}
                    onChange={(e) => handleExecutiveChange(index, "studentId", e.target.value)}
                    required
                    data-field={`executiveMembers.${index}.studentId`}
                    className={errors[`executiveMembers.${index}.studentId`] ? 'invalid' : ''}
                  />
                  {errors[`executiveMembers.${index}.studentId`] && <div className="error-message">{errors[`executiveMembers.${index}.studentId`]}</div>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Designation (letters only)"
                    value={member.designation}
                    onChange={(e) => handleExecutiveChange(index, "designation", e.target.value)}
                    {...getDesignationValidationProps()}
                    required
                    data-field={`executiveMembers.${index}.designation`}
                    className={errors[`executiveMembers.${index}.designation`] ? 'invalid' : ''}
                  />
                  {errors[`executiveMembers.${index}.designation`] && <div className="error-message">{errors[`executiveMembers.${index}.designation`]}</div>}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) => handleExecutiveChange(index, "email", e.target.value)}
                    required
                    data-field={`executiveMembers.${index}.email`}
                    className={errors[`executiveMembers.${index}.email`] ? 'invalid' : ''}
                  />
                  {errors[`executiveMembers.${index}.email`] && <div className="error-message">{errors[`executiveMembers.${index}.email`]}</div>}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone (10 digits)"
                    value={member.phone}
                    onChange={(e) => handleExecutiveChange(index, "phone", e.target.value)}
                    {...getPhoneValidationProps()}
                    required
                    data-field={`executiveMembers.${index}.phone`}
                    className={errors[`executiveMembers.${index}.phone`] ? 'invalid' : ''}
                  />
                  {errors[`executiveMembers.${index}.phone`] && <div className="error-message">{errors[`executiveMembers.${index}.phone`]}</div>}
                </div>

                <div>
                  <select
                    value={member.faculty}
                    onChange={(e) => handleExecutiveChange(index, "faculty", e.target.value)}
                    required
                    data-field={`executiveMembers.${index}.faculty`}
                    className={errors[`executiveMembers.${index}.faculty`] ? 'invalid' : ''}
                  >
                    <option value="">Select Faculty</option>
                    {facultyOptions.map((fac) => (
                      <option key={fac} value={fac}>{fac}</option>
                    ))}
                  </select>
                  {errors[`executiveMembers.${index}.faculty`] && <div className="error-message">{errors[`executiveMembers.${index}.faculty`]}</div>}
                </div>

                <div>
                  <select
                    value={member.academicYear}
                    onChange={(e) => handleExecutiveChange(index, "academicYear", e.target.value)}
                    required
                    data-field={`executiveMembers.${index}.academicYear`}
                    className={errors[`executiveMembers.${index}.academicYear`] ? 'invalid' : ''}
                  >
                    <option value="">Select Academic Year</option>
                    {academicYearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors[`executiveMembers.${index}.academicYear`] && <div className="error-message">{errors[`executiveMembers.${index}.academicYear`]}</div>}
                </div>
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