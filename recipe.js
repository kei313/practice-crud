import express from "express";
import { sql } from "./db.js";

const recipeRouter = express.Router();


// GET /food
recipeRouter.get("/food", async (req, res) => {
  const recipes = await sql`SELECT name, type FROM "recipes"`;
  res.status(200).send(recipes);
});

// GET /food/:id
recipeRouter.get("/food/:id", async (req, res) => {
  const { id } = req.params;
  const [foundRecipe] = await sql`SELECT * FROM "recipes" WHERE recipe_id = ${Number(id)};`;

  if (foundRecipe) {
    res.status(200).send(foundRecipe);
  } else {
    res.status(404).send("recipe not found");
  }
});

// GET /food/type/:type
recipeRouter.get("/food/type/:type", async (req, res) => {
  const { type } = req.params;
  try {
    const rows = await sql`SELECT * FROM recipes WHERE type = ${(type)}`;
    if (rows.length === 0) {
      res.status(404).json({ error: "Recipes not found" });
    } else {
      const recipes = [];
      for (const row of rows) {
        const ingredientsResult = await sql`SELECT name, quantity, condition FROM "ingredients" WHERE recipe_id = ${row.recipe_id}`;
        row.ingredients = ingredientsResult.rows;
        recipes.push(row);
      }
      res.status(200).send(recipes);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// POST /recipe
recipeRouter.post("/recipe", async (req, res) => {
  const { name, type, instructions } = req.body;
  try {
    const [result] = await sql`INSERT INTO recipes (name, type, instructions) VALUES (${name}, ${type}, ${instructions}) RETURNING recipe_id, name, type, instructions`;
   
     return res.status(201).send(result);
    
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send({ error: "Failed to insert recipe" });
  }
});



// PATCH /food/:id
recipeRouter.patch("/food/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, instructions } = req.body;
  try {
    const [result] = await sql`UPDATE recipes SET name = ${name}, type = ${type}, instructions = ${instructions} WHERE recipe_id = ${id} RETURNING name, type, instructions`;
      res.status(200).send(result);
    
  } catch (error) {
    console.log("Error updating recipe:", error);
    res.status(500).send({ error: "Failed update recipe" });
  }
});

 // DELETE /food/:id
 recipeRouter.delete("/food/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // First, delete related ingredients
    const deleteIngredientsResult = await sql`DELETE FROM ingredients WHERE recipe_id = ${id}`;

    // Then, delete the recipe itself
    const deleteRecipeResult = await sql`DELETE FROM recipes WHERE recipe_id = ${id}`;
    if (deleteRecipeResult.rowCount === 0) {
      res.status(404).json({ error: "Recipe not found" });
    } else {
      res.status(204).send(); // Successful deletion, no content to return
    }
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



/* Start the server
appRouter.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});*/

//module.exports = pool;
export default recipeRouter;
