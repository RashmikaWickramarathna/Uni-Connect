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
  bankAccount: {
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
  },
  signatureLetter: {
    presidentSigned: false,
    vicePresidentSigned: false,
    secretarySigned: false,
    treasurerSigned: false,
    letterFile: null,
  },
  advisor: {
    ...emptyAdvisor,
    designation: "Advisor",
  },
  president: {
    ...emptyMember,
    designation: "President",
  },
  vicePresident: {
    ...emptyMember,
    designation: "Vice President",
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