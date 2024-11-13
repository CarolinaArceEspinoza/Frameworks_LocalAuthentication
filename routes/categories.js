import express from 'express';
import Category from '../models/categories.js';
import AuthenticationMiddleware from '../extensions/authentication.js';

const router = express.Router();

// GET /Categories/
router.get("/", AuthenticationMiddleware, async (req, res, next) => {
  let categories = await Category.find().sort([["name", "ascending"]]);
  res.render("categories/index", { title: "Category List", dataset: categories, user: req.user });
});

// GET /Categories/Add
router.get("/add", AuthenticationMiddleware, (req, res, next) => {
  res.render("categories/add", { title: "Add a new Activity", user: req.user });
});
 
// POST /Categories/Add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newCategory = new Category({
    name: req.body.name,
    category: req.body.category,
    ages: req.body.ages
  });
  await newCategory.save();
  res.redirect("/categories");
});

export default router; 
