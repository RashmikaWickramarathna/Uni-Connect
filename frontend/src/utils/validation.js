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
];

export const academicYearOptions = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
];

export const categoryOptions = [
  "Workshop",
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
export const validateForm = (formData) => {
  const errors = [];

  // Validate contact number (10 digits)
  if (!validatePhoneNumber(formData.contactNumber)) {
    errors.push("Contact number must be exactly 10 digits");
  }

  // Validate advisor
  if (formData.advisor.name && !validateName(formData.advisor.name)) {
    errors.push("Advisor name can only contain letters");
  }
  if (formData.advisor.designation && !validateDesignation(formData.advisor.designation)) {
    errors.push("Advisor designation can only contain letters");
  }

  // Validate president
  if (!validateName(formData.president.name)) {
    errors.push("President name can only contain letters");
  }
  if (!validateDesignation(formData.president.designation)) {
    errors.push("President designation can only contain letters");
  }
  if (!validateStudentId(formData.president.studentId, formData.president.faculty)) {
    errors.push(`President's ${getStudentIdErrorMessage(formData.president.faculty)}`);
  }
  if (!validatePhoneNumber(formData.president.phone)) {
    errors.push("President's phone number must be exactly 10 digits");
  }

  // Validate vice president
  if (!validateName(formData.vicePresident.name)) {
    errors.push("Vice President name can only contain letters");
  }
  if (!validateDesignation(formData.vicePresident.designation)) {
    errors.push("Vice President designation can only contain letters");
  }
  if (!validateStudentId(formData.vicePresident.studentId, formData.vicePresident.faculty)) {
    errors.push(`Vice President's ${getStudentIdErrorMessage(formData.vicePresident.faculty)}`);
  }
  if (!validatePhoneNumber(formData.vicePresident.phone)) {
    errors.push("Vice President's phone number must be exactly 10 digits");
  }

  // Validate secretary
  if (!validateName(formData.secretary.name)) {
    errors.push("Secretary name can only contain letters");
  }
  if (!validateDesignation(formData.secretary.designation)) {
    errors.push("Secretary designation can only contain letters");
  }
  if (!validateStudentId(formData.secretary.studentId, formData.secretary.faculty)) {
    errors.push(`Secretary's ${getStudentIdErrorMessage(formData.secretary.faculty)}`);
  }
  if (!validatePhoneNumber(formData.secretary.phone)) {
    errors.push("Secretary's phone number must be exactly 10 digits");
  }

  // Validate treasurer
  if (!validateName(formData.treasurer.name)) {
    errors.push("Treasurer name can only contain letters");
  }
  if (!validateDesignation(formData.treasurer.designation)) {
    errors.push("Treasurer designation can only contain letters");
  }
  if (!validateStudentId(formData.treasurer.studentId, formData.treasurer.faculty)) {
    errors.push(`Treasurer's ${getStudentIdErrorMessage(formData.treasurer.faculty)}`);
  }
  if (!validatePhoneNumber(formData.treasurer.phone)) {
    errors.push("Treasurer's phone number must be exactly 10 digits");
  }

  // Validate executive members
  formData.executiveMembers.forEach((member, index) => {
    if (!validateName(member.name)) {
      errors.push(`Executive Member ${index + 1} name can only contain letters`);
    }
    if (!validateDesignation(member.designation)) {
      errors.push(`Executive Member ${index + 1} designation can only contain letters`);
    }
    if (!validateStudentId(member.studentId, member.faculty)) {
      errors.push(`Executive Member ${index + 1}'s ${getStudentIdErrorMessage(member.faculty)}`);
    }
    if (!validatePhoneNumber(member.phone)) {
      errors.push(`Executive Member ${index + 1}'s phone number must be exactly 10 digits`);
    }
  });

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
