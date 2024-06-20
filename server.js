const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public/images")));

app.use("/api/product", require("./routes/product"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/order", require("./routes/order"));
app.use("/api/user", require("./routes/user"));
app.use("/api/upload", require("./routes/upload"));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Connect failed: " + err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
