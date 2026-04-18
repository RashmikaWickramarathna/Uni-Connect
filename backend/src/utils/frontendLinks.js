const stripTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

const getMainFrontendUrl = () =>
  stripTrailingSlash(process.env.FRONTEND_URL || "http://localhost:5173");

const getRegistrationFrontendUrl = () => {
  const explicitRegistrationUrl = stripTrailingSlash(
    process.env.REGISTRATION_FRONTEND_URL
  );

  if (explicitRegistrationUrl) {
    return explicitRegistrationUrl;
  }

  return `${getMainFrontendUrl()}/social-dashboard`;
};

const buildRegistrationLink = (token) => {
  const baseUrl = getRegistrationFrontendUrl();
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}approvalToken=${encodeURIComponent(token)}`;
};

module.exports = {
  getMainFrontendUrl,
  getRegistrationFrontendUrl,
  buildRegistrationLink,
};
