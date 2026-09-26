const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (!token) {
    return res.status(401).json({ message: "token missing" });
  }
  let decode;
  try {
    decode = jwt.verify(token, process.env.JWTPASS);
  } catch (error) {
    return res.status(401).json({ message: "invalid token" });
  }
  req.user = {
    id: decode.id,
    role: decode.role,
  };
  next();
};

module.exports = authMiddleware;
