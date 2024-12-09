const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename
  },
});
const upload = multer({ storage });

router.get("/folders", (req, res) => {
  db.all("SELECT * FROM folders", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get("/sub-directories/:folderId", (req, res) => {
  const { folderId } = req.params;

  db.all(
    "SELECT id, name, 'folder' AS type FROM folders WHERE parent_id = ? UNION ALL SELECT id, name, 'file' AS type FROM files WHERE folder_id = ?",
    [folderId, folderId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create Folder API
router.post("/create-folder", (req, res) => {
  const { name, parent_id } = req.body;

  db.run(
    "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
    [name, parent_id || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, parent_id });
    }
  );
});

// Create Sub-Directories API
router.get("/sub-directories/:folderId", (req, res) => {
  const { folderId } = req.params;
  db.all("SELECT * FROM folders WHERE parent_id = ?", [folderId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Upload File API
router.post("/upload-file", upload.single("file"), (req, res) => {
  const { folder_id } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  db.run(
    "INSERT INTO files (name, folder_id) VALUES (?, ?)",
    [file.filename, folder_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name: file.filename, folder_id });
    }
  );
});

module.exports = router;
