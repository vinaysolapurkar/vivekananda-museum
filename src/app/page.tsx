import Link from "next/link";

const modules = [
  {
    href: "/guide",
    title: "Audio Guide",
    description: "Explore the museum with guided audio narration",
    icon: "🎧",
    color: "bg-primary",
  },
  {
    href: "/kiosk",
    title: "Kiosk Displays",
    description: "Interactive exhibit presentations",
    icon: "🖥️",
    color: "bg-saffron",
  },
  {
    href: "/chat",
    title: "Ask Vivekananda",
    description: "AI-powered chat about Swami Vivekananda",
    icon: "💬",
    color: "bg-accent",
  },
  {
    href: "/quiz",
    title: "Take a Quiz",
    description: "Test your knowledge and earn a certificate",
    icon: "📝",
    color: "bg-primary-light",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="bg-primary text-text-light py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
          Vivekananda Smriti
        </h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-body">
          Welcome to the Ramakrishna Ashram Museum, Mysore.
          <br />
          Discover the life and teachings of Swami Vivekananda.
        </p>
      </header>

      {/* Quote */}
      <div className="bg-saffron/10 border-l-4 border-saffron px-6 py-4 mx-4 mt-8 rounded-r-lg max-w-3xl md:mx-auto w-full md:w-auto">
        <p className="italic text-text-dark font-heading text-lg">
          &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
        </p>
        <p className="text-text-muted mt-1 text-sm">— Swami Vivekananda</p>
      </div>

      {/* Module Cards */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group block rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-saffron/50"
            >
              <div
                className={`w-14 h-14 ${m.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {m.icon}
              </div>
              <h2 className="text-xl font-semibold font-heading text-primary mb-1">
                {m.title}
              </h2>
              <p className="text-text-muted text-sm">{m.description}</p>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-text-light/70 text-center py-6 text-sm">
        <p>Ramakrishna Ashram, Mysore</p>
        <Link href="/admin" className="text-saffron hover:underline mt-1 inline-block">
          Admin
        </Link>
      </footer>
    </div>
  );
}
