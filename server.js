const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./database.sqlite');

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Statische Dateien (z. B. index.html)

// Datenbank initialisieren
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// API-Endpunkte

// Feedback speichern
app.post('/api/feedback', (req, res) => {
    const { name, message } = req.body;
    db.run(
        'INSERT INTO feedback (name, message) VALUES (?, ?)',
        [name, message],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Feedback abrufen
app.get('/api/feedback', (req, res) => {
    db.all('SELECT * FROM feedback ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});