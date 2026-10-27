import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosProductos,
  validarId,
  validarProducto,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET para entregar listado de productos
router.get(
  "/",
  validarFiltrosProductos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { nombre, cantidadMin, cantidadMax } = req.query;

    if (nombre) {
      filtros.push("p.nombre LIKE ?");
      parametros.push(`%${nombre}%`);
    }

    if (cantidadMin !== undefined) {
      filtros.push("p.cantidad >= ?");
      parametros.push(Number(cantidadMin));
    }

    if (cantidadMax !== undefined) {
      filtros.push("p.cantidad <= ?");
      parametros.push(Number(cantidadMax));
    }

    let sql =
      "SELECT p.id, p.nombre, p.cantidad, c.nombre AS categoria " +
      "FROM productos p " +
      "JOIN categorias c ON p.categoria_id = c.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    // Agregar consulta para paginacion
    const { page, limit } = req.query;
    if (page && limit) {
      const offset = (Number(page) - 1) * Number(limit);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    // Agregar consulta para ordenar por nombre o cantidad, ascendente o descendente
    const { orderBy, orderDirection } = req.query;
    if (orderBy && (orderDirection === "asc" || orderDirection === "desc")) {
      sql += ` ORDER BY p.${orderBy} ${orderDirection.toUpperCase()}`;
    }

    const [productos] = await db.execute(sql, parametros);
    res.send(productos);
  },
);

// GET para entregar detalle de producto
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  // Obtengo id
  const id = Number(req.params.id);

  let sql =
    "SELECT p.id, p.nombre, p.cantidad, c.nombre AS categoria " +
    "FROM productos p " +
    "JOIN categorias c ON p.categoria_id = c.id " +
    "WHERE p.id = ?";

  const [productos] = await db.execute(sql, [id]);

  if (productos.length === 0) {
    return res.status(404).send("Producto no encontrado");
  }

  res.send(productos[0]);
});

// POST para crear producto
router.post("/", validarProducto, verificarValidaciones, async (req, res) => {
  // Obtengo body
  const { nombre, categoriaId, cantidad } = req.body;

  const [result] = await db.execute(
    "INSERT INTO productos (nombre, categoria_id, cantidad) VALUES (?,?,?)",
    [nombre, categoriaId, cantidad],
  );

  res.status(201).send({ id: result.insertId, nombre, categoriaId, cantidad });
});

// PUT para actualizar producto
router.put("/id", validarProducto, verificarValidaciones, async (req, res) => {
  // Obtengo body
  const { nombre, categoriaId, cantidad } = req.body;

  const [result] = await db.execute(
    "UPDATE productos SET nombre=?, categoria_id=?, cantidad=? WHERE id=?",
    [nombre, categoriaId, cantidad, req.params.id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).send("Producto no encontrado");
  }
  res.status(200).send({ mensaje: "Producto actualizado correctamente" });
});

// DELETE para eliminar producto
router.delete(
  "/id",
  validarProducto,
  verificarValidaciones,
  async (req, res) => {
    const [result] = await db.execute("DELETE FROM productos WHERE id=?", [
      req.params.id,
    ]);

    res.status(200).send({ mensaje: "Producto eliminado correctamente" });
  },
);

export default router;
