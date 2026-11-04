import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0f13" }}>
        <div style={{ width: 70, height: 70, borderRadius: 70, background: "#f0962a" }} />
      </div>
    ),
    size,
  );
}
