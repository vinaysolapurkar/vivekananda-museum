export default function MapPage() {
  return (
    <div style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}>
      <iframe
        src="/viveka-digvijaya/index.html"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        title="Vivekananda Travels — Digvijaya Globe"
        allow="fullscreen"
      />
    </div>
  );
}
