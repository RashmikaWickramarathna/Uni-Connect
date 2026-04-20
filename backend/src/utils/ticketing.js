const DEFAULT_GENERAL_TICKET_PRICE = Math.max(
  1,
  Number(process.env.DEFAULT_GENERAL_TICKET_PRICE) || 500
);

const LEGACY_TICKET_LABELS = {
  general: "General Admission",
  vip: "VIP",
  early_bird: "Early Bird",
  student: "Student Pass",
  complimentary: "Complimentary",
};

const slugifyTicketType = (value, fallback = "general") => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return slug || fallback;
};

const humanizeTicketType = (value) => {
  const type = slugifyTicketType(value);
  if (LEGACY_TICKET_LABELS[type]) {
    return LEGACY_TICKET_LABELS[type];
  }

  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getTicketLabel = (ticket, index = 0) => {
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

  return humanizeTicketType(ticket?.type) || `Tier ${index + 1}`;
};

const inferIsFreeEventFromTickets = (tickets, fallback = false) => {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return fallback;
  }

  return tickets.every((ticket) => Math.max(0, Number(ticket?.price) || 0) === 0);
};

const buildDefaultTickets = (seatCount = 100, isFreeEvent = false) => [
  {
    type: "general",
    label: isFreeEvent ? "Free Pass" : "General Admission",
    price: isFreeEvent ? 0 : DEFAULT_GENERAL_TICKET_PRICE,
    totalSeats: Math.max(1, Number(seatCount) || 100),
    description: isFreeEvent ? "Free admission" : "General admission",
  },
];

const isLegacyGeneralFallbackTicket = (ticket, type, rawPrice) => {
  const description = String(ticket?.description || "").trim().toLowerCase();
  return (
    type === "general" &&
    rawPrice === 0 &&
    (!description || description === "general admission")
  );
};

const normalizeTicketEntry = (
  ticket,
  fallbackSeats = 100,
  { isFreeEvent = false, allowLegacyPaidFallback = false, index = 0 } = {}
) => {
  const type = slugifyTicketType(ticket?.type || ticket?.label || `tier_${index + 1}`);
  const rawPrice = Number(ticket?.price);
  const totalSeats = Number(ticket?.totalSeats);
  const label = getTicketLabel(ticket, index);

  return {
    type,
    label,
    price: isFreeEvent
      ? 0
      : allowLegacyPaidFallback && isLegacyGeneralFallbackTicket(ticket, type, rawPrice)
        ? DEFAULT_GENERAL_TICKET_PRICE
        : Math.max(0, Number.isFinite(rawPrice) ? rawPrice : 0),
    totalSeats:
      Number.isFinite(totalSeats) && totalSeats > 0 ? totalSeats : Math.max(1, fallbackSeats),
    description: String(ticket?.description || "").trim(),
  };
};

const parseTicketsInput = (tickets, fallbackSeats = 100, options = {}) => {
  if (!tickets) return [];

  let parsedTickets = tickets;
  if (typeof tickets === "string") {
    try {
      parsedTickets = JSON.parse(tickets);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedTickets)) return [];
  return parsedTickets.map((ticket, index) =>
    normalizeTicketEntry(ticket, fallbackSeats, { ...options, index })
  );
};

const validateUniqueTicketTypes = (tickets = []) => {
  const normalizedTypes = tickets.map((ticket) => slugifyTicketType(ticket?.type));
  return new Set(normalizedTypes).size === normalizedTypes.length;
};

module.exports = {
  DEFAULT_GENERAL_TICKET_PRICE,
  buildDefaultTickets,
  getTicketLabel,
  humanizeTicketType,
  inferIsFreeEventFromTickets,
  normalizeTicketEntry,
  parseTicketsInput,
  slugifyTicketType,
  validateUniqueTicketTypes,
};
