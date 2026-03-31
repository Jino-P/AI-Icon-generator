import { useEffect, useState } from "react";
import api from "../services/api";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      api.get(`/auth/verify-email?token=${token}`)
        .then(() => {
          setStatus("success");

          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "loading" && <h2>🔄 Verifying your email...</h2>}
      {status === "success" && <h2>✅ Email verified! Redirecting...</h2>}
      {status === "error" && <h2>❌ Invalid or expired link</h2>}
    </div>
  );
}