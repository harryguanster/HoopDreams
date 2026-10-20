"use client";
import Arena3D from "./Arena3D";

export default function ArenaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Arena3D />
    </div>
  );
}
