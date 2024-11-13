// Importamos express y creamos el objeto router
import express from 'express';
const router = express.Router();

// Importamos los modelos de mongoose que vamos a utilizar
import Workshop from '../models/workshops.js';
import Category from '../models/categories.js';

// Importamos el middleware de autenticación
import AuthenticationMiddleware from '../extensions/authentication.js';

// Configuración de los controladores GET/POST

// GET /workshops/
router.get("/", async (req, res, next) => {
  // Obtenemos todos los proyectos, ordenados por la fecha de vencimiento
  let workshops = await Workshop.find().sort([["dueDate", "descending"]]);
  res.render("workshops/index", {
    title: "Workshop Tracker",
    dataset: workshops,
    user: req.user,
  });
});

// GET /workshops/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  // Obtenemos la lista de cursos
  let categoryList = await Category.find().sort([["name", "ascending"]]);
  res.render("workshops/add", {
    title: "Add a New Workshop",
    categories: categoryList,
    user: req.user,
  });
});

// POST /workshops/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  // Creamos un nuevo proyecto con los datos recibidos del formulario
  let newWorkshop = new Workshop({
    name: req.body.name,
    dueDate: req.body.dueDate,
    category: req.body.category,
  });
  // Guardamos el proyecto en la base de datos
  await newWorkshop.save();
  res.redirect("/workshops");
});

// GET /workshops/delete/_id
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let workshopId = req.params._id;
  // Eliminar el proyecto por su ID
  await Workshop.findByIdAndRemove({ _id: workshopId });
  res.redirect("/workshops");
});

// GET /workshops/edit/_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let workshopId = req.params._id;
  let workshopData = await Workshop.findById(workshopId);
  let categoryList = await Category.find().sort([["name", "ascending"]]);
  res.render("workshops/edit", {
    title: "Edit Workshop Info",
    workshop: workshopData,
    categories: categoryList,
    user: req.user,
  });
});

// POST /workshops/edit/_id
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let workshopId = req.params._id;
  // Actualizamos el proyecto con los datos recibidos del formulario
  await Workshop.findByIdAndUpdate(
    { _id: workshopId },
    {
      name: req.body.name,
      dueDate: req.body.dueDate,
      category: req.body.category,
      support: req.body.support,
    }
  );
  res.redirect("/workshops");
});

// Exportamos el router
export default router;
