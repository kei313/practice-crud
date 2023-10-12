import express from "express";
import morgan from "morgan";
import recipeRouter from "./recipe.js";
import ingredientRouter from "./ingredient.js";

const app = express();

const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App is listening at http://${host}:${port}`);
});

app.use(express.json());
app.use(morgan("dev"));
app.use("/recipeRouter", recipeRouter);
app.use("/ingredientRouter", ingredientRouter);
