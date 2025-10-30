// scripts/hash-admin.js
import bcrypt from "bcrypt";

const senha = "123456"; // senha original do admin
const saltRounds = 10;

bcrypt.hash(senha, saltRounds).then((hash) => {
  console.log("Senha criptografada:");
  console.log(hash);
});
