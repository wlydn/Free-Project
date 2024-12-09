const sqlite3 = require("sqlite3").verbose();

const setupDatabase = async () => {
  const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
      console.error("Error opening database", err.message);
    } else {
      console.log("Database connected");
    }
  });

  db.serialize(() => {
    // Buat tabel folders
    db.run(
      `CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES folders (id)
      )`
    );

    // Buat tabel files
    db.run(
      `CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        folder_id INTEGER,
        FOREIGN KEY (folder_id) REFERENCES folders (id)
      )`
    );
  });

  // Fungsi untuk menambahkan data awal
  const insertInitialData = async () => {
    const createFolder = (name, parent_id) =>
      new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
          [name, parent_id],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

    const createFile = (name, folder_id) =>
      new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO files (name, folder_id) VALUES (?, ?)",
          [name, folder_id],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

    const insertDataRecursively = async (data, parent_id = null) => {
      for (const item of data) {
        if (item.type === "folder") {
          const folderId = await createFolder(item.name, parent_id);
          if (item.children) {
            await insertDataRecursively(item.children, folderId);
          }
        } else if (item.type === "file") {
          await createFile(item.name, parent_id);
        }
      }
    };

    const initialFileSystem = {
      name: "Root",
      type: "folder",
      children: [
        {
          name: "Documents",
          type: "folder",
          children: [
            {
              name: "Work",
              type: "folder",
              children: [
                { name: "Proposal.docx", type: "file" },
                { name: "Report.pdf", type: "file" },
              ],
            },
            {
              name: "Personal",
              type: "folder",
              children: [{ name: "Notes.txt", type: "file" }],
            },
          ],
        },
        {
          name: "Pictures",
          type: "folder",
          children: [
            {
              name: "Vacation",
              type: "folder",
              children: [
                { name: "beach.jpg", type: "file" },
                { name: "mountain.png", type: "file" },
              ],
            },
            {
              name: "Family",
              type: "folder",
              children: [{ name: "birthday.jpg", type: "file" }],
            },
          ],
        },
        {
          name: "Downloads",
          type: "folder",
          children: [
            { name: "installer.exe", type: "file" },
            { name: "document.pdf", type: "file" },
          ],
        },
      ],
    };

    await insertDataRecursively([initialFileSystem]);
  };

  // Panggil fungsi untuk menambahkan data awal
  await insertInitialData();

  return db;
};

module.exports = setupDatabase;