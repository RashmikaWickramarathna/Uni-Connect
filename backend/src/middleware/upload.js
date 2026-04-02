const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload directory: backend/uploads/signature-letters
const uploadDir = path.join(__dirname, "..", "..", "uploads", "signature-letters");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"));
  }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
