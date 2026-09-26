const userModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ message: "email,name and password are required" });
    }

    const existUser = await userModel.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({ message: "email allready used" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await userModel.insertOne({
      email,
      name,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({ message: "admin created", data: newUser });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existUser = await userModel.findOne({ email: email });

    if (!existUser) {
      return res.status(400).json({ message: "email not exist " });
    }

    const isCorrectPassword = bcrypt.compareSync(password, existUser.password);

    if (!isCorrectPassword) {
      return res.status(400).json({ message: "wrong password" });
    }

    if (existUser.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const token = jwt.sign(
      { id: existUser._id, name: existUser.name, role: existUser.role },
      process.env.JWTPASS,
      { expiresIn: "24h" },
    );

    res.json({
      message: "success",
      authToken: token,
      id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      role: existUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not available",
      });
    }

    let user = await userModel.findOne({ email });

    // New Google user → register automatically
    if (!user) {
      user = await userModel.create({
        name: name || "Google User",
        email,
        googleId,
        picture: picture || null,
        password: null,
        role: "user",
      });
    } else {
      // Existing user → attach Google account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (picture && !user.picture) {
        user.picture = picture;
      }

      await user.save();
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "User access required",
      });
    }

    const authToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWTPASS,
      {
        expiresIn: "24h",
      },
    );

    res.json({
      message: "Google login successful",
      authToken,
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || null,
      role: user.role,
    });
  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};
