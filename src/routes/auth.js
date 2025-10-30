// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Registro
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento, genero } = req.body;
    if (!nome || !email || !senha || !data_nascimento || !genero) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    const [exist] = await db.query("SELECT id FROM usuarios WHERE email = ? OR nome = ?", [email, nome]);
    if (exist.length) return res.status(400).json({ message: "E-mail ou nome já cadastrado." });

    const hashed = await bcrypt.hash(senha, 10);
    await db.query(
      "INSERT INTO usuarios (nome, email, senha, data_nascimento, genero) VALUES (?, ?, ?, ?, ?)",
      [nome, email, hashed, data_nascimento, genero]
    );

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Login (aceita email ou nome)
router.post("/login", async (req, res) => {
  try {
    const { identifier, senha } = req.body; // identifier = email ou nome
    if (!identifier || !senha) return res.status(400).json({ message: "Preencha todos os campos." });

    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ? OR nome = ?", [identifier, identifier]);
    if (!rows.length) return res.status(401).json({ message: "Usuário não encontrado." });

    const usuario = rows[0];
    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(401).json({ message: "Senha incorreta." });

    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // em produção: true (HTTPS)
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({ message: "Login realizado!", usuario: { nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Perfil protegido (exemplo)
router.get("/perfil", (req, res) => {
  // este endpoint será protegido pelo middleware (no server.js)
  const usuario = req.user;
  res.json({ usuario });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado." });
});

export default router;
