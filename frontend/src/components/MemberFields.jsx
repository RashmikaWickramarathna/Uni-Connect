import {
  facultyOptions,
  academicYearOptions,
  getPhoneValidationProps,
  getNameValidationProps,
  getDesignationValidationProps,
} from "../utils/validation";

export default function MemberFields({ title, data, onChange, prefix, isAdvisor = false, errors = {} }) {
  const getError = (field) => errors && errors[`${prefix}.${field}`];

  return (
    <div className="card">
      <h3>{title}</h3>

      <div className="grid two">
        <div>
          <input
            type="text"
            placeholder="Name (letters only)"
            value={data.name}
            onChange={(e) => onChange(prefix, "name", e.target.value)}
            {...getNameValidationProps()}
            required
            data-field={`${prefix}.name`}
            className={getError("name") ? "invalid" : ""}
          />
          {getError("name") && <div className="error-message">{getError("name")}</div>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Designation (letters only)"
            value={data.designation}
            onChange={(e) => onChange(prefix, "designation", e.target.value)}
            {...getDesignationValidationProps()}
            required
            data-field={`${prefix}.designation`}
            className={getError("designation") ? "invalid" : ""}
          />
          {getError("designation") && <div className="error-message">{getError("designation")}</div>}
        </div>

        {!isAdvisor && (
          <div>
            <input
              type="text"
              placeholder="Student ID (e.g., IT123456)"
              value={data.studentId}
              onChange={(e) => onChange(prefix, "studentId", e.target.value)}
              required
              data-field={`${prefix}.studentId`}
              className={getError("studentId") ? "invalid" : ""}
            />
            {getError("studentId") && <div className="error-message">{getError("studentId")}</div>}
          </div>
        )}

        <div>
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => onChange(prefix, "email", e.target.value)}
            required
            data-field={`${prefix}.email`}
            className={getError("email") ? "invalid" : ""}
          />
          {getError("email") && <div className="error-message">{getError("email")}</div>}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Phone (10 digits)"
            value={data.phone}
            onChange={(e) => onChange(prefix, "phone", e.target.value)}
            {...getPhoneValidationProps()}
            required
            data-field={`${prefix}.phone`}
            className={getError("phone") ? "invalid" : ""}
          />
          {getError("phone") && <div className="error-message">{getError("phone")}</div>}
        </div>

        <div>
          <select
            value={data.faculty}
            onChange={(e) => onChange(prefix, "faculty", e.target.value)}
            required
            data-field={`${prefix}.faculty`}
            className={getError("faculty") ? "invalid" : ""}
          >
            <option value="">Select Faculty</option>
            {facultyOptions.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>
          {getError("faculty") && <div className="error-message">{getError("faculty")}</div>}
        </div>

        {!isAdvisor && (
          <div>
            <select
              value={data.academicYear}
              onChange={(e) => onChange(prefix, "academicYear", e.target.value)}
              required
              data-field={`${prefix}.academicYear`}
              className={getError("academicYear") ? "invalid" : ""}
            >
              <option value="">Select Academic Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {getError("academicYear") && <div className="error-message">{getError("academicYear")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}