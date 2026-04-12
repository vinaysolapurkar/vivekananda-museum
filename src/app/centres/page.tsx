export default function CentresPage() {
  return (
    <div style={{ position: "fixed", inset: 0, width: "100%", height: "100%", touchAction: "none" }}>
      <iframe
        src="/rkm-centres/index.html"
        style={{ width: "100%", height: "100%", border: "none", display: "block", touchAction: "none" }}
        title="Ramakrishna Math & Mission — Branch Centres"
        allow="fullscreen"
      />
    </div>
  );
}
