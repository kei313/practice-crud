import express from "express";
import { sql } from "./db.js";

const ingredientRouter = express.Router();

  // POST /ingredients/:recipe_id
  ingredientRouter.post("/ingredient/:recipe_id", async (req, res) => {
    const { recipe_id } = req.params;
    const ingredients = req.body.ingredients;
    try {
      const insertedIngredients = [];
      for (const ingredient of ingredients) {
        const { name, quantity, condition } = ingredient;
        const result = await sql`INSERT INTO ingredients (recipe_id, name, quantity, condition) VALUES (${Number(recipe_id)}, ${name}, ${quantity}, ${condition}) RETURNING ingredient_id, recipe_id, name`;
        insertedIngredients.push({
          ingredient_id: result[0].ingredient_id,
          recipe_id: result[0].recipe_id,
          name: result[0].name
        });
      }
      res.status(201).json({ ingredients: insertedIngredients });
    } catch (error) {
      console.error("Error inserting ingredients:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  

  // PATCH /ingredient/:ingredient_id
  ingredientRouter.patch("/ingredient/:id", async (req, res) => {
    const { id } = req.params;
    const { name, quantity, condition } = req.body;
    try {
      const [result] = await sql`UPDATE ingredients SET name = ${name}, quantity = ${quantity}, condition = ${condition} WHERE ingredient_id = ${id} RETURNING name, quantity, condition`;
        res.status(200).send(result);
      
    } catch (error) {
      console.log("Error updating recipe:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
  
  // DELETE /food/:id
 ingredientRouter.delete("/ingredient/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // First, delete related ingredients
      const deleteIngredientsResult = await sql`DELETE FROM ingredients WHERE recipe_id = ${id}`;

      if (deleteIngredientsResult.rowCount === 0) {
        res.status(404).json({ error: "Recipe not found" });
      } else {
        res.status(204).send(); // Successful deletion, no content to return
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
 

  export default ingredientRouter;