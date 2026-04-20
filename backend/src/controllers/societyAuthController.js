const Society = require("../models/society");
const {
  serializeSocietyAccount,
  verifySocietyPassword,
} = require("../utils/societyAccount");

const loginSociety = async (req, res) => {
  try {
    const officialEmail = String(
      req.body?.officialEmail || req.body?.email || ""
    )
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!officialEmail || !password) {
      return res.status(400).json({
        message: "Official email and password are required",
      });
    }

    const society = await Society.findOne({ officialEmail });

    if (!society) {
      return res.status(401).json({
        message: "Invalid official email or password",
      });
    }

    const passwordMatches = await verifySocietyPassword(society, password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid official email or password",
      });
    }

    if (String(society.status || "").toLowerCase() !== "active") {
      return res.status(403).json({
        message: "This society account is not active yet",
      });
    }

    return res.status(200).json({
      message: "Society login successful",
      data: serializeSocietyAccount(society),
    });
  } catch (error) {
    console.error("SOCIETY LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Failed to log into society account",
      error: error.message,
    });
  }
};

module.exports = {
  loginSociety,
};
