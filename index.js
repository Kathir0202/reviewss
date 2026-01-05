import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

/* ==========================
   DATABASE CONNECTION
========================== */
const db = new pg.Client({
  connectionString:process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

await db.connect();





/* ==========================
   CREATE TABLES (ADDED)
========================== */
async function createTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      userid TEXT,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      rating INT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tables created / already exist");
}




await createTables();

/* ==========================
   LOGIN ROUTE (UNCHANGED)
========================== */
app.post("/login", async (req, res) => {
  const { userid, password } = req.body;

  try {
    await db.query(
      "INSERT INTO users (userid, password) VALUES ($1, $2)",
      [userid, password]
    );

    console.log("Inserted user:", userid);
    res.redirect("/reviews.html");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ==========================
   REVIEW ROUTE (UNCHANGED)
========================== */
app.post("/reviews", async (req, res) => {
  const { rating, comment } = req.body;

  try {
    await db.query(
      "INSERT INTO reviews (rating, comment) VALUES ($1, $2)",
      [rating, comment]
    );

    res.redirect("/thankyou.html");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ==========================
   DEBUG ROUTES (ADDED)
========================== */
app.get("/debug/logins", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM users ORDER BY id DESC"
  );
  res.json(result.rows);
});

app.get("/debug/reviews", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM reviews ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* ==========================
   START SERVER
========================== */
app.listen(port, () => {
  console.log('🚀 Server running on port ${port}');
});

