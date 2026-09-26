const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, requried: true, trim: true },
    email: {
      type: String,
      unique: true,
      requried: true,
      trim: true,
      validator: {
        validate: [
          (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
          "regex error",
        ],
      },
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Present for Google users
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    picture: {
      type: String,
      default: null,
    },
  },

  { versionKey: false, timestamps: true },
);

const userModel = mongoose.model("USER", userSchema);

module.exports = userModel;
