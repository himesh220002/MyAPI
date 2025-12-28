"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function IndexPage() {
  const [name, setName] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Invalid Password! Access Denied.");
      return;
    }

    let inputToParse = jsonData.trim();
    // ... existing auto-fix logic ...
    if (!inputToParse.startsWith("{") && !inputToParse.startsWith("[")) {
      if (inputToParse.includes("},")) {
        inputToParse = `[${inputToParse}]`;
      } else if (inputToParse.includes(":")) {
        inputToParse = `{${inputToParse}}`;
      }
    } else if (inputToParse.startsWith("{") && !inputToParse.startsWith("[")) {
      if (inputToParse.includes("},")) {
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
        alert("Asset saved successfully!");
        setName("");
        setJsonData("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("JSON Parse Error:", err);
      alert("Invalid JSON format: " + err.message);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1600px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2.5rem", fontWeight: "800", background: "linear-gradient(to right, #72c293ff 0%, #133652ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        API Asset Manager
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "600", color: "#444" }}>Asset Name</label>
          <input
            placeholder="e.g. Gold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            style={{
              background: "#18202eff",
              color: "#99e03bff",
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
            autoComplete="off"
            rows={10}
            style={{
              padding: "15px",
              background: "#18202eff",
              color: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "600", color: "#444" }}>Admin Password</label>
          <input
            type="password"
            placeholder="Enter password to save"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#18202eff",
              border: "1px solid #ddd",
              fontSize: "16px",
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
            background: "#221c1cff",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.1s, background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#1a2441ff"}
          onMouseOut={(e) => e.currentTarget.style.background = "#141212ff"}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Save Asset
        </button>
      </form>
    </div>
  );
}
