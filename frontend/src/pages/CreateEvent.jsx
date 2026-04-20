import React from "react";
import { useParams } from "react-router-dom";

export default function CreateEvent() {
  const { token } = useParams();

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Event (Placeholder)</h1>
      <p>This is a placeholder Create Event page. Your team can implement the full UI here.</p>
      {token && (
        <p>
          <strong>Token:</strong> {token}
        </p>
      )}
    </div>
  );
}
