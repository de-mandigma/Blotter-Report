export const INITIAL_FORM_DATA = {
  complainantFirstName: "",
  complainantMiddleName: "",
  complainantLastName: "",
  phoneNumber: "",
  fullAddress: "",
  otherContacts: "",
  proofType: "ID",
  attachmentIDFront: null,
  attachmentIDBack: null,
  attachmentUtility: null,
  previewIDFront: null,
  previewIDBack: null,
  previewUtility: null,
  subjectName: "",
  subjectContext: "",
  description: "",
  category: "",
  severity: "",
  incidentDateTime: new Date().toISOString(),
  location: "",
  complaintAttachment: [],
};

export const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export const STATUS_STYLES = {
  // Complaint statuses
  PENDING: "bg-[#fffbea] text-[#b58105]",
  IN_PROGRESS: "bg-[#e6f0ff] text-[#2563eb]",
  ESCALATION_REQUESTED: "bg-[#fff4e5] text-[#c2410c]",
  ESCALATED: "bg-[#f3e8ff] text-[#9333ea]",
  RESOLVED: "bg-[#e8f5e9] text-[var(--color-primary)]",
  REJECTED: "bg-[#fdecea] text-[#d32f2f]",

  // Blotter statuses
  FILED: "bg-[#fef9c3] text-[#b45309]",
  UNDER_MEDIATION: "bg-[#e0f2fe] text-[#0284c7]",
  REFERRED: "bg-[#ede9fe] text-[#7c3aed]",

  // Fallback
  DEFAULT: "bg-gray-100 text-gray-800",
};
