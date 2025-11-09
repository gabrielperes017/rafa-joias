// src/server.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";

dotenv.config();
const app = express();

// ======= MIDDLEWARES =======
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ======= CAMINHOS =======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/html", express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "style")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/aneis", express.static(path.join(__dirname, "aneis")));

// ======= TESTE DE CONEXÃO =======
async function testarConexao() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ Banco de dados conectado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao conectar no banco:", err);
  }
}
testarConexao();

// ======= AUTENTICAÇÃO JWT =======
function autenticar(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Usuário não autenticado." });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

// ======= ROTAS =======

// Cadastro
app.post("/api/cadastro", async (req, res) => {
  const { nome, email, senha, telefone, genero } = req.body;
  if (!nome || !email || !senha || !telefone || !genero)
    return res.status(400).json({ message: "Preencha todos os campos." });

  try {
    const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0)
      return res.status(400).json({ message: "E-mail já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);
    await db.query(
      "INSERT INTO usuarios (nome, email, senha, telefone, genero, tipo, criado_em) VALUES (?, ?, ?, ?, ?, 'cliente', NOW())",
      [nome, email, hash, telefone, genero]
    );

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro no cadastro:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: "Preencha todos os campos." });

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Usuário não encontrado." });

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ message: "Senha incorreta." });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Perfil protegido
app.get("/api/perfil", autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso." });
});

// ======= HTML ROTAS =======
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "html", "main.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "html", "login.html")));
app.get("/cadastro", (req, res) => res.sendFile(path.join(__dirname, "html", "cadastro.html")));
app.get("/perfil", (req, res) => res.sendFile(path.join(__dirname, "html", "perfil.html")));
app.get("/carrinho", (req, res) => res.sendFile(path.join(__dirname, "html", "carrinho.html")));

// ======= INICIA SERVIDOR =======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
