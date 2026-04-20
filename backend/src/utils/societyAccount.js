const bcrypt = require("bcrypt");

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const serializeSocietyAccount = (society) => ({
  id: society?._id || null,
  societyName: society?.societyName || "",
  officialEmail: society?.officialEmail || "",
  category: society?.category || "",
  faculty: society?.faculty || "",
  description: society?.description || "",
  contactNumber: society?.contactNumber || "",
  status: society?.status || "",
  role: "society",
});

const verifySocietyPassword = async (society, plainPassword) => {
  const password = String(plainPassword || "");
  const storedPassword = String(society?.password || "");

  if (!password || !storedPassword) {
    return false;
  }

  if (BCRYPT_HASH_PATTERN.test(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }

  if (storedPassword !== password) {
    return false;
  }

  society.password = await bcrypt.hash(password, 10);
  await society.save();
  return true;
};

module.exports = {
  serializeSocietyAccount,
  verifySocietyPassword,
};
