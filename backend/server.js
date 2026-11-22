
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Movie app backend is running!");
});

// Test database
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            console.error("DB TEST ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Database connection failed"
            });
        }

        res.json({
            success: true,
            message: "Hostinger database connected!"
        });
    });
});

// Record movie search
app.post("/api/search", (req, res) => {
    const { movie_id, search_term, poster_url } = req.body;

    if (!movie_id || !search_term) {
        return res.status(400).json({
            success: false,
            message: "Movie ID and search term are required"
        });
    }

    const sql = `
        INSERT INTO trending_movies
        (movie_id, search_term, poster_url, search_count)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
        search_term = VALUES(search_term),
        poster_url = VALUES(poster_url),
        search_count = search_count + 1
    `;

    db.query(
        sql,
        [movie_id, search_term, poster_url || null],
        (err, result) => {
            if (err) {
                console.error("MYSQL INSERT ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not save movie search"
                });
            }

            console.log("MOVIE SAVED:", search_term);

            res.json({
                success: true,
                message: "Movie search recorded!"
            });
        }
    );
});

// Fetch trending movies
app.get("/api/trending", (req, res) => {
    const sql = `
        SELECT movie_id, search_term, poster_url, search_count
        FROM trending_movies
        ORDER BY search_count DESC, movie_id ASC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("TRENDING ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Could not fetch trending movies"
            });
        }

        res.json({
            success: true,
            results
        });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
