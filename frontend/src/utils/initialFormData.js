export const emptyMember = {
  name: "",
  studentId: "",
  designation: "",
  email: "",
  phone: "",
  faculty: "",
  academicYear: "",
};

export const emptyAdvisor = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  faculty: "",
};

export const initialFormData = {
  societyName: "",
  shortName: "",
  category: "",
  faculty: "",
  description: "",
  objectives: "",
  officialEmail: "",
  contactNumber: "",
  advisor: {
    ...emptyAdvisor,
    designation: "Advisor",
  },
  president: {
    ...emptyMember,
    designation: "President",
  },
  secretary: {
    ...emptyMember,
    designation: "Secretary",
  },
  treasurer: {
    ...emptyMember,
    designation: "Treasurer",
  },
  executiveMembers: [
    { ...emptyMember },
    { ...emptyMember },
    { ...emptyMember },
  ],
};