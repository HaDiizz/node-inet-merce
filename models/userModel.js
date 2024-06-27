const mongoose = require("mongoose");
const Counter = require("./counterModel");

const userSchema = new mongoose.Schema(
  {
    user_id: { type: Number, unique: true },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "user_id" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      user.user_id = counter.value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("users", userSchema);
