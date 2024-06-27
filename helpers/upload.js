const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      (new Date().getTime() + "_" + file.originalname).replaceAll(/\s/g, "")
    );
  },
});
const upload = multer({ storage });
module.exports = upload;
