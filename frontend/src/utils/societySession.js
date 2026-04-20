export const SOCIETY_USER_KEY = 'societyUser';

const safeText = (value) => String(value ?? '');

export const normalizeSocietySession = (value, allowLoose = false) => {
  if (!value || typeof value !== 'object') return null;

  const role = safeText(value.role).trim().toLowerCase();
  const societyName = safeText(value.societyName || value.organizer || value.name).trim();
  const officialEmail = safeText(value.officialEmail || value.organizerEmail || value.email)
    .trim()
    .toLowerCase();

  const looksLikeSociety =
    allowLoose ||
    role === 'society' ||
    Boolean(value.societyName) ||
    Boolean(value.officialEmail) ||
    Boolean(value.organizerEmail);

  if (!looksLikeSociety || (!societyName && !officialEmail)) return null;

  return {
    id: value.id || value._id || null,
    name: societyName,
    societyName,
    email: officialEmail,
    officialEmail,
    category: safeText(value.category).trim(),
    faculty: safeText(value.faculty).trim(),
    description: safeText(value.description).trim(),
    contactNumber: safeText(value.contactNumber).trim(),
    status: safeText(value.status).trim(),
    role: 'society',
  };
};

export const readStoredSocietyUser = () => {
  try {
    const storedUser = localStorage.getItem(SOCIETY_USER_KEY);
    if (!storedUser) return null;

    return normalizeSocietySession(JSON.parse(storedUser), true);
  } catch (error) {
    console.error('Failed to parse stored society user:', error);
    localStorage.removeItem(SOCIETY_USER_KEY);
    return null;
  }
};

export const storeSocietyUser = (value) => {
  const normalized = normalizeSocietySession(value, true);

  if (!normalized) {
    localStorage.removeItem(SOCIETY_USER_KEY);
    return null;
  }

  localStorage.setItem(SOCIETY_USER_KEY, JSON.stringify(normalized));
  return normalized;
};

export const clearStoredSocietyUser = () => {
  localStorage.removeItem(SOCIETY_USER_KEY);
};
