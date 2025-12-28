"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

function AssetItem({ asset, onUpdate }: { asset: any; onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(JSON.stringify(asset.data, null, 2));
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = editedData !== JSON.stringify(asset.data, null, 2);

  const handleSave = async () => {
    const pwd = window.prompt("Enter admin password to save changes:");
    console.log("Checking password for Edit...", { input: pwd, expected: process.env.NEXT_PUBLIC_ADMIN_PASSWORD });
    if (pwd?.trim() !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Invalid Password! Change denied.");
      return;
    }

    try {
      console.log("Saving changes for asset:", asset.id);
      const parsed = JSON.parse(editedData);
      setIsSaving(true);
      const { data, error } = await supabase
        .from("assets")
        .update({ data: parsed })
        .eq("id", asset.id);

      if (error) {
        console.error("Supabase update error:", error);
        alert("Update Error: " + error.message);
      } else {
        console.log("Update successful:", data);
        alert("Asset successfully updated!");
        setIsEditing(false);
        onUpdate(); // Refresh the list
      }
    } catch (err) {
      console.error("Save catch block error:", err);
      alert("Invalid JSON format. Please correct it before saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const pwd = window.prompt("Enter admin password to DELETE this asset:");
    console.log("Checking password for Delete...", { input: pwd, expected: process.env.NEXT_PUBLIC_ADMIN_PASSWORD });
    if (pwd?.trim() !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Invalid Password! Deletion denied.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete '${asset.name}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id);

      if (error) {
        alert("Delete Error: " + error.message);
      } else {
        alert("Asset deleted successfully!");
        onUpdate();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{
      border: "1px solid #1e293b",
      borderRadius: "12px",
      overflow: "hidden",
      background: "#16202c",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", background: "#1e293b" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            flex: 1,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            color: "#f8fafc",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.parentElement!.style.background = "#2c5ba1ff"}
          onMouseOut={(e) => e.currentTarget.parentElement!.style.background = "#1e293b"}
        >
          <span>{asset.name}</span>
          <span style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            fontSize: "12px"
          }}>
            ▼
          </span>
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: "20px", background: "#0b1625ff" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
            <button
              onClick={handleDelete}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "12px"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
            >
              Delete
            </button>
            <button
              onClick={() => {
                if (isEditing) setEditedData(JSON.stringify(asset.data, null, 2));
                setIsEditing(!isEditing);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #334155",
                background: isEditing ? "#475569" : "#1e293b",
                color: "white",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            {isEditing && hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#2c5ba1ff",
                  color: "white",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editedData}
              onChange={(e) => setEditedData(e.target.value)}
              style={{
                width: "100%",
                height: "300px",
                background: "#010810",
                color: "#60a5fa",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "'Fira Code', monospace",
                border: "1px solid #2c5ba1ff",
                outline: "none",
                resize: "vertical"
              }}
            />
          ) : (
            <pre style={{
              background: "#010810",
              // color: "#60a5fa",
              color: "#82b93aff",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: "14px",
              margin: 0,
              border: "1px solid #1e293b"
            }}>
              {JSON.stringify(asset.data, null, 2)}
            </pre>
          )}

          <div style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#64748b",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>ID: {asset.id}</span>
            <span>{new Date(asset.created_at).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssetsList() {
  const [assets, setAssets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    const { data, error } = await supabase.from("assets").select("*").order('created_at', { ascending: false });
    if (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } else {
      setAssets(data || []);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1600px", margin: "0 auto", color: "#f8fafc" }}>
      <h2 style={{
        borderBottom: "2px solid #2c5ba1ff",
        paddingBottom: "15px",
        marginBottom: "30px",
        fontSize: "24px",
        fontWeight: "700"
      }}>
        Saved Assets
      </h2>

      {error && (
        <p style={{
          color: "#f87171",
          background: "rgba(248, 113, 113, 0.1)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(248, 113, 113, 0.2)"
        }}>
          Error: {error}
        </p>
      )}

      {assets.length === 0 && !error && (
        <p style={{ fontStyle: "italic", color: "#94a3b8", textAlign: "center", padding: "40px" }}>
          No assets found. Start by creating one above!
        </p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {assets.map((asset) => (
          <AssetItem key={asset.id} asset={asset} onUpdate={fetchAssets} />
        ))}
      </div>
    </div>
  );
}
