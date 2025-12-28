"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function IndexPage() {
  const [name, setName] = useState("");
  const [jsonData, setJsonData] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let inputToParse = jsonData.trim();

    // Smart Auto-fix:
    if (!inputToParse.startsWith("{") && !inputToParse.startsWith("[")) {
      // If it has multiple objects separated by commas, wrap in [ ]
      if (inputToParse.includes("},")) {
        inputToParse = `[${inputToParse}]`;
      }
      // If it looks like a property list "key": val, wrap in { }
      else if (inputToParse.includes(":")) {
        inputToParse = `{${inputToParse}}`;
      }
    } else if (inputToParse.startsWith("{") && !inputToParse.startsWith("[")) {
      // Handle the case where someone types {...}, {...} without brackets
      if (inputToParse.includes("},")) {
        // Only wrap if it's not already a single complete object
        try { JSON.parse(inputToParse); }
        catch { inputToParse = `[${inputToParse}]`; }
      }
    }

    try {
      const parsed = JSON.parse(inputToParse);

      const payload = {
        name: name || parsed.name || "Unnamed Asset",
        data: parsed,
      };

      const { error } = await supabase.from("assets").insert([payload]);

      if (error) {
        alert("Database Error: " + error.message);
      } else {
        alert("Asset saved successfully as a single record!");
        setName("");
        setJsonData("");
      }
    } catch (err: any) {
      console.error("JSON Parse Error:", err);
      alert("Invalid JSON format. I tried to auto-fix the formatting but it's still invalid: " + err.message);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1600px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2.5rem", fontWeight: "800", background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        API Asset Creator
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "600", color: "#444" }}>Asset Name</label>
          <input
            placeholder="e.g. Gold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: "#2c5ba1ff",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "600", color: "#444" }}>Asset Metadata (JSON)</label>
          <textarea
            placeholder={`{
  "price": 128500,
  "unit": "per 10g",
  "history": { "high": 130000, "low": 125000, "avg": 127500 }
}`}
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            rows={10}
            style={{
              padding: "15px",
              background: "#2c5ba1ff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "15px",
            borderRadius: "8px",
            border: "none",
            background: "#333",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.1s, background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#000"}
          onMouseOut={(e) => e.currentTarget.style.background = "#333"}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Save Asset
        </button>
      </form>
    </div>
  );
}
