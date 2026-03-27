import { 
  facultyOptions, 
  academicYearOptions,
  getPhoneValidationProps,
  getNameValidationProps,
  getDesignationValidationProps
} from "../utils/validation";

export default function MemberFields({
  title,
  data,
  onChange,
  prefix,
  isAdvisor = false,
}) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <div className="grid two">
        <input
          type="text"
          placeholder="Name (letters only)"
          value={data.name}
          onChange={(e) => onChange(prefix, "name", e.target.value)}
          {...getNameValidationProps()}
          required
        />

        <input
          type="text"
          placeholder="Designation (letters only)"
          value={data.designation}
          onChange={(e) => onChange(prefix, "designation", e.target.value)}
          {...getDesignationValidationProps()}
          required
        />

        {!isAdvisor && (
          <input
            type="text"
            placeholder="Student ID (e.g., IT123456)"
            value={data.studentId}
            onChange={(e) => onChange(prefix, "studentId", e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => onChange(prefix, "email", e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Phone (10 digits)"
          value={data.phone}
          onChange={(e) => onChange(prefix, "phone", e.target.value)}
          {...getPhoneValidationProps()}
          required
        />

        <select
          value={data.faculty}
          onChange={(e) => onChange(prefix, "faculty", e.target.value)}
          required
        >
          <option value="">Select Faculty</option>
          {facultyOptions.map((fac) => (
            <option key={fac} value={fac}>{fac}</option>
          ))}
        </select>

        {!isAdvisor && (
          <select
            value={data.academicYear}
            onChange={(e) => onChange(prefix, "academicYear", e.target.value)}
            required
          >
            <option value="">Select Academic Year</option>
            {academicYearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}