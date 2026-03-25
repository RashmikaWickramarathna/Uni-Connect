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
          placeholder="Name"
          value={data.name}
          onChange={(e) => onChange(prefix, "name", e.target.value)}
        />

        <input
          type="text"
          placeholder="Designation"
          value={data.designation}
          onChange={(e) => onChange(prefix, "designation", e.target.value)}
        />

        {!isAdvisor && (
          <input
            type="text"
            placeholder="Student ID"
            value={data.studentId}
            onChange={(e) => onChange(prefix, "studentId", e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => onChange(prefix, "email", e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone"
          value={data.phone}
          onChange={(e) => onChange(prefix, "phone", e.target.value)}
        />

        <input
          type="text"
          placeholder="Faculty"
          value={data.faculty}
          onChange={(e) => onChange(prefix, "faculty", e.target.value)}
        />

        {!isAdvisor && (
          <input
            type="text"
            placeholder="Academic Year"
            value={data.academicYear}
            onChange={(e) => onChange(prefix, "academicYear", e.target.value)}
          />
        )}
      </div>
    </div>
  );
}