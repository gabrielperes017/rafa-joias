// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function autenticaJWT(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);
  if (!token) return res.status(401).json({ message: "Não autenticado." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }
}
