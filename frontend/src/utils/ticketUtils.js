const DEFAULT_TIER_TEMPLATE = [
  { type: "tier_1", label: "Tier 1", price: 250, totalSeats: 30 },
  { type: "tier_2", label: "Tier 2", price: 500, totalSeats: 30 },
  { type: "tier_3", label: "Tier 3", price: 750, totalSeats: 20 },
  { type: "tier_4", label: "Tier 4", price: 1000, totalSeats: 20 },
];

const LEGACY_TICKET_LABELS = {
  general: "General Admission",
  vip: "VIP",
  early_bird: "Early Bird",
  student: "Student Pass",
  complimentary: "Complimentary",
};

export const slugifyTicketType = (value, fallback = "general") => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return slug || fallback;
};

export const humanizeTicketType = (value) => {
  const key = slugifyTicketType(value);
  if (LEGACY_TICKET_LABELS[key]) {
    return LEGACY_TICKET_LABELS[key];
  }

  return key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getTicketLabel = (ticket, index = 0) => {
  const explicitLabel = String(ticket?.label || "").trim();
  if (explicitLabel) {
    return explicitLabel;
  }

  const fallbackDescription = String(ticket?.description || "").trim();
  if (
    fallbackDescription &&
    !["general admission", "free admission"].includes(fallbackDescription.toLowerCase())
  ) {
    return fallbackDescription;
  }

  const humanizedType = humanizeTicketType(ticket?.type);
  return humanizedType || `Tier ${index + 1}`;
};

export const formatTicketLabel = (ticket, index = 0) =>
  getTicketLabel(ticket, index) || `Tier ${index + 1}`;

export const formatTicketPrice = (value) => {
  const amount = Number(value) || 0;
  return amount <= 0 ? "Free" : `Rs. ${amount.toLocaleString()}`;
};

export const createDefaultPaidTiers = () =>
  DEFAULT_TIER_TEMPLATE.map((ticket) => ({
    ...ticket,
    description: "",
  }));

export const createFreeTicketTier = (seatCount = 100) => ({
  type: "general",
  label: "Free Pass",
  price: 0,
  totalSeats: Math.max(1, Number(seatCount) || 100),
  description: "Free admission",
});

export const sumTicketSeats = (tickets) =>
  (Array.isArray(tickets) ? tickets : []).reduce(
    (sum, ticket) => sum + Math.max(0, Number(ticket?.totalSeats) || 0),
    0
  );
