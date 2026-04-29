const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5001;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_name TEXT NOT NULL,
    result TEXT NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
app.get("/", (req, res) => {
  res.send("Backend is running.");
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Email already exists." });
      }

      res.json({
        message: "Signup successful.",
        userId: this.lastID,
      });
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });
});

app.post("/game-result", (req, res) => {
  const { userId, gameName, result } = req.body;

  if (!userId || !gameName || !result) {
    return res.status(400).json({ error: "Missing game result data." });
  }

  db.run(
    "INSERT INTO game_results (user_id, game_name, result) VALUES (?, ?, ?)",
    [userId, gameName, result],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Could not save game result." });
      }

      res.json({
        message: "Game result saved.",
        resultId: this.lastID
      });
    }
  );
});

app.get("/stats/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
    SELECT 
      game_name,
      result,
      COUNT(*) as count
    FROM game_results
    WHERE user_id = ?
    GROUP BY game_name, result
    `,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Could not get stats." });
      }

      res.json(rows);
    }
  );
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});