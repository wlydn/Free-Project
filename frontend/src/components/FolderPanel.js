import React, { useEffect, useState } from "react";
import { getSubDirectories, createFolder, getFolders } from "../services/api";

function FolderPanel({ folderId, onSelectFolder }) {
  const [items, setItems] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    getFolders().then((data) => setFolders(data));
  }, []);

  useEffect(() => {
    if (folderId) {
      getSubDirectories(folderId).then(setItems);
    }
  }, [folderId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return alert("Folder name is required");
    const folder = await createFolder(newFolderName, folderId);
    setItems([...items, { ...folder, type: "folder" }]);
    setNewFolderName("");
  };

  return (
    <div>
      <h3>Contents</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.type === "folder" ? (
              <button onClick={() => onSelectFolder(item.id)}>{item.name}</button>
            ) : (
              <span>{item.name}</span>
            )}
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
        />
        <button onClick={handleCreateFolder}>Create Folder</button>
      </div>
    </div>
  );
}

export default FolderPanel;