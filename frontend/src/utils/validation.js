// Validation utilities for Society Registration Form

// Faculty mapping for student ID validation
export const facultyCodes = {
  "Faculty of Computing": ["IT", "it"],
  "SLIIT Business School": ["BM", "bm"],
  "Faculty of Engineering": ["EN", "en"],
  "School of Architecture": ["AR", "ar"],
  "Faculty of Humanities & Sciences": ["HS", "hs"],
};

// Dropdown options
export const facultyOptions = [
  "Faculty of Computing",
  "SLIIT Business School",
  "Faculty of Engineering",
  "School of Architecture",
  "Faculty of Humanities & Sciences",
  "None",
];

export const academicYearOptions = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
];

export const categoryOptions = [
  "Workshop",
  "Society",
  "Seminar",
  "Competition",
  "Sports Event",
  "Cultural Event",
  "Music Event",
  "Club Meeting",
  "Awareness Program",
  "Training Session",
  "Networking Event",
  "Fundraising Event",
  "Exhibition",
  "Conference",
  "Orientation Program",
  "Volunteer Activity",
  "Other",
];

// Validation functions
export const validatePhoneNumber = (phone) => {
  // Remove any spaces or special characters
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Check if it's exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleaned);
};

export const validateName = (name) => {
  // Only letters (a-z, A-Z) and spaces allowed
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name) && name.trim().length > 0;
};

export const validateDesignation = (designation) => {
  // Only letters (a-z, A-Z) and spaces allowed
  const designationRegex = /^[a-zA-Z\s]+$/;
  return designationRegex.test(designation) && designation.trim().length > 0;
};

export const validateStudentId = (studentId, faculty) => {
  if (!studentId || !faculty) return false;
  
  const validCodes = facultyCodes[faculty];
  if (!validCodes) return false;
  
  // Check if student ID starts with any of the valid faculty codes
  const startsWithValidCode = validCodes.some(code => 
    studentId.toUpperCase().startsWith(code.toUpperCase())
  );
  
  return startsWithValidCode;
};

export const getStudentIdErrorMessage = (faculty) => {
  const codes = facultyCodes[faculty];
  if (!codes) return "Invalid faculty selected";
  return `Student ID must start with ${codes.join(" or ")}`;
};

// Validate entire form
// Field-level validation helpers
const getValueByPath = (obj, path) => {
  if (!path) return undefined;
  const parts = path.split('.');
  return parts.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    // numeric index
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, obj);
};

const fieldLabel = (path) => {
  const parts = path.split('.');
  const last = parts[parts.length - 1];
  const root = parts[0];
  const readableField = {
    name: 'Name',
    designation: 'Designation',
    studentId: 'Student ID',
    email: 'Email',
    phone: 'Phone',
    faculty: 'Faculty',
    academicYear: 'Academic Year',
    societyName: 'Society Name',
    shortName: 'Short Name',
    category: 'Category',
    description: 'Description',
    objectives: 'Objectives',
    officialEmail: 'Official Email',
    contactNumber: 'Contact Number',
    accountHolderName: 'Account Holder Name',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    branchName: 'Branch Name',
    letterFile: 'Signature Letter',
    presidentSigned: 'Confirmation',
  }[last] || last;

  if (root === 'advisor') return `Advisor ${readableField}`;
  if (root === 'president') return `President ${readableField}`;
  if (root === 'vicePresident') return `Vice President ${readableField}`;
  if (root === 'secretary') return `Secretary ${readableField}`;
  if (root === 'treasurer') return `Treasurer ${readableField}`;
  if (root === 'executiveMembers') {
    const idx = parts[1];
    const pos = isNaN(Number(idx)) ? '' : `Executive Member ${Number(idx) + 1} `;
    return `${pos}${readableField}`.trim();
  }

  return readableField;
};

export const validateField = (formData, path) => {
  const value = getValueByPath(formData, path);
  const label = fieldLabel(path);

  // Basic required checks for many fields
  if (path === 'societyName') {
    if (!value || !String(value).trim()) return `${label} is required`;
    return null;
  }

  if (path === 'category') {
    if (!value) return `${label} is required`;
    return null;
  }

  if (path === 'faculty') {
    if (!value) return `${label} is required`;
    return null;
  }

  if (path === 'officialEmail') {
    if (!value) return `${label} is required`;
    // basic email check
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(value)) return `Please enter a valid ${label.toLowerCase()}`;
    return null;
  }

  if (path === 'contactNumber') {
    if (!value) return `${label} is required`;
    if (!validatePhoneNumber(value)) return `${label} must be exactly 10 digits`;
    return null;
  }

  // Bank account checks
  if (path.startsWith('bankAccount')) {
    if (!value || !String(value).trim()) return `${fieldLabel(path)} is required`;
    return null;
  }

  // Advisor and other member name/designation/email/phone checks
  if (path.endsWith('.name')) {
    if (!value || !validateName(value)) return `${label} can only contain letters`;
    return null;
  }

  if (path.endsWith('.designation')) {
    if (!value || !validateDesignation(value)) return `${label} can only contain letters`;
    return null;
  }

  if (path.endsWith('.email')) {
    if (!value) return `${label} is required`;
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(value)) return `Please enter a valid ${label.toLowerCase()}`;
    return null;
  }

  if (path.endsWith('.phone')) {
    if (!value) return `${label} is required`;
    if (!validatePhoneNumber(value)) return `${label} must be exactly 10 digits`;
    return null;
  }

  if (path.endsWith('.studentId')) {
    // need faculty to validate
    const parts = path.split('.');
    const prefix = parts.slice(0, -1).join('.');
    const faculty = getValueByPath(formData, `${prefix}.faculty`);
    if (!value) return `${label} is required`;
    if (!validateStudentId(value, faculty)) return `${label} must start with ${faculty ? facultyCodes[faculty].join(' or ') : 'valid faculty code'}`;
    return null;
  }

  // Executive members: array-level checks handled in validateAll

  // Checkbox confirmation
  if (path === 'signatureLetter.presidentSigned') {
    if (!value) return `You must confirm the statement before submitting`;
    return null;
  }

  // File upload validation (type)
  if (path === 'signatureLetter.letterFile') {
    if (!value) return null; // file optional in many cases
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!value.type || (!allowed.includes(value.type) && !value.type.startsWith('image/'))) {
      return `Only PDF and image files are allowed`;
    }
    return null;
  }

  return null;
};

export const validateAll = (formData) => {
  const errors = {};

  // Basic fields
  const basics = ['societyName','category','faculty','officialEmail','contactNumber','description'];
  basics.forEach((k) => {
    const msg = validateField(formData, k);
    if (msg) errors[k] = msg;
  });

  // Bank account
  ['bankAccount.accountHolderName','bankAccount.accountNumber','bankAccount.bankName','bankAccount.branchName'].forEach((k) => {
    const msg = validateField(formData, k);
    if (msg) errors[k] = msg;
  });

  // Advisor
  ['advisor.name','advisor.designation','advisor.email','advisor.phone','advisor.faculty'].forEach((k) => {
    const msg = validateField(formData, k);
    if (msg) errors[k] = msg;
  });

  // Core officers
  ['president','vicePresident','secretary','treasurer'].forEach((role) => {
    ['name','designation','studentId','email','phone','faculty','academicYear'].forEach((field) => {
      const path = `${role}.${field}`;
      const msg = validateField(formData, path);
      if (msg) errors[path] = msg;
    });
  });

  // Executive members
  if (!Array.isArray(formData.executiveMembers) || formData.executiveMembers.length < 3) {
    errors['executiveMembers'] = 'At least 3 executive members are required';
  }
  formData.executiveMembers.forEach((member, idx) => {
    ['name','designation','studentId','email','phone','faculty','academicYear'].forEach((field) => {
      const path = `executiveMembers.${idx}.${field}`;
      const msg = validateField(formData, path);
      if (msg) errors[path] = msg;
    });
  });

  // Signature letter checks
  const sigConfirmMsg = validateField(formData, 'signatureLetter.presidentSigned');
  if (sigConfirmMsg) errors['signatureLetter.presidentSigned'] = sigConfirmMsg;

  const fileMsg = validateField(formData, 'signatureLetter.letterFile');
  if (fileMsg) errors['signatureLetter.letterFile'] = fileMsg;

  return errors;
};

// Real-time validation helpers
export const getPhoneValidationProps = () => ({
  maxLength: 10,
  pattern: "[0-9]{10}",
  title: "Please enter exactly 10 digits",
});

export const getNameValidationProps = () => ({
  pattern: "[a-zA-Z\\s]+",
  title: "Only letters and spaces are allowed",
});

export const getDesignationValidationProps = () => ({
  pattern: "[a-zA-Z\\s]+",
  title: "Only letters and spaces are allowed",
});
