import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";

const router = express.Router();

// GET usuarios
router.get("/", async (req, res) => {
  const [usuarios] = await db.execute("SELECT * FROM usuarios");
  // RECORDAR Quitar la contraseña en la api
  res.json(usuarios.map((u) => ({ ...u, password: undefined })));
});

// GET usuario por ID
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [usuarios] = await db.execute(
    "SELECT id, username, nombres, apellidos, esAdmin FROM usuarios WHERE id=?",
    [id],
  );

  if (usuarios.length === 0) {
    return res.status(404).json("Usuario no encontrado");
  }

  res.json(usuarios[0]);
});

// POST usuario
router.post(
  "/",
  body("username").isAlphanumeric("es-ES").isLength({ max: 50 }),
  body("apellidos").isAlpha("es-ES").isLength({ max: 50 }),
  body("nombres").isAlpha("es-ES").isLength({ max: 50 }),
  body("password").isStrongPassword({
    minLength: 8, // Minimo de 8 caracteres
    minLowercase: 1, // Al menos una letra en minusculas
    minUppercase: 0, // Letras mayusculas opcionales
    minNumbers: 1, // Al menos un número
    minSymbols: 0, // Símbolos opcionales
  }),
  body("esAdmin").isBoolean(),
  verificarValidaciones,
  async (req, res) => {
    const { username, apellidos, nombres, password, esAdmin } = req.body;

    // Creamos Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (username, apellidos, nombres, password, esAdmin) VALUES (?,?,?,?,?)",
      [username, apellidos, nombres, hashedPassword, esAdmin],
    );

    res
      .status(201)
      .json({ id: result.insertId, username, apellidos, nombres, esAdmin });
  },
);

// PUT usuario
router.put("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [usuarios] = await db.execute(
    "SELECT id, username, nombres, apellidos, esAdmin FROM usuarios WHERE id=?",
    [id],
  );

  if (usuarios.length === 0) {
    return res.status(404).json("Usuario no encontrado");
  }

  const { username, apellidos, nombres, esAdmin } = req.body;

  await db.execute(
    "UPDATE usuarios SET username=?, apellidos=?, nombres=?, esAdmin=? WHERE id=?",
    [username, apellidos, nombres, esAdmin, id],
  );

  res.json({ id, username, apellidos, nombres, esAdmin });
});

// DELETE usuario
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [usuarios] = await db.execute("SELECT id FROM usuarios WHERE id=?", [
    id,
  ]);

  if (usuarios.length === 0) {
    return res.status(404).json("Usuario no encontrado");
  }

  await db.execute("DELETE FROM usuarios WHERE id=?", [id]);
  res.json({ message: "Usuario eliminado" });
});

export default router;
