import express from 'express';
const router = express.Router();

import Workshop from '../models/workshops.js';
import Category from '../models/categories.js';

import AuthenticationMiddleware from '../extensions/authentication.js';

// GET /workshops/
router.get("/", AuthenticationMiddleware, async (req, res, next) => {
  let workshops = await Workshop.find().sort([["dueDate", "descending"]]);
  res.render("workshops/index", {
    title: "Workshop Tracker",
    dataset: workshops,
    user: req.user,
  });
});

// GET /workshops/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  let categoryList = await Category.find().sort([["name", "ascending"]]);
  res.render("workshops/add", {
    title: "Add a New Workshop",
    categories: categoryList,
    user: req.user,
  });
});

router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newWorkshop = new Workshop({
    name: req.body.name,
    dueDate: req.body.dueDate,
    category: req.body.category,
  });

  await newWorkshop.save();
  res.redirect("/workshops");
});


router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let workshopId = req.params._id;

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

export default router;
