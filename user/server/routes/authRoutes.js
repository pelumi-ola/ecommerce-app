const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  googleLogin,
} = require("../controllers/authController");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,

  message: {
    status: "fail",
    message: "Too many login attempts. Please try again in 10 minutes.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/user/register", register);
router.post("/api/user/login", loginLimiter, login);
router.post("/api/user/google-login", googleLogin);

module.exports = router;
