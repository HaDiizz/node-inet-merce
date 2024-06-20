const multer = require("multer");
const router = require("express").Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/single", upload.single("file"), (_, res) => {
  return res.send({
    message: "Upload successful",
  });
});

router.post("/multiple", upload.array("file", 3), (_, res) => {
  return res.send({
    message: "Upload successful",
  });
});

module.exports = router;
