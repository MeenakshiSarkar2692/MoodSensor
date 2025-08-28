import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  // fetch latest history
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/mood", { text });
      setMood(res.data.mood || "");
      setMessage(res.data.message || "");
      setText("");
      fetchHistory();
    } catch (err) {
      console.error("Error detecting mood:", err);
      alert("Detect failed — check console.");
    }
  };

  // clear all history (existing)
  const clearHistory = async () => {
    try {
      await axios.delete("http://localhost:5000/api/history");
      setHistory([]); // clear UI
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Mood Detection App</h1>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type how you feel..."
          rows="3"
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Detect Mood</button>
          <button type="button" onClick={clearHistory} style={{ background: "#ff5252" }}>
            Clear History
          </button>
        </div>
      </form>

      {mood && (
        <div className="result-box">
          <h2>Detected Mood: <span>{mood}</span></h2>
          <p className="message">{message}</p>
        </div>
      )}

      <div className="history-header">
        <h2 className="history-title">Recent Mood History</h2>
      </div>

      <ul className="history-list">
        {history.length === 0 && <li className="empty">No history saved yet.</li>}
        {history.map((entry) => (
          <li key={entry._id || entry.createdAt} className="history-item">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{entry.mood}</div>
                <div style={{ marginTop: 6 }}>{entry.text}</div>
                <div className="small-message">{entry.message}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{new Date(entry.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
