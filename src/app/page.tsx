import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold">
              CC
            </div>
            <div>
              <div className="font-semibold text-stone-900 leading-tight">Chola Chela</div>
              <div className="text-[10px] uppercase tracking-widest text-orange-700">Photography</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-orange-700"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium rounded-full bg-orange-700 text-white hover:bg-orange-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-6">
              Production Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-6">
              Zambia’s photo book platform is being built here
            </h1>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              This is the production foundation for Chola Chela Photography.
              Real authentication, cloud photo storage, auto-created photo books,
              and order management are being implemented step by step.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-orange-700 text-white font-semibold hover:bg-orange-800 transition"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-semibold hover:border-orange-400 transition"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="bg-white border-t border-stone-200 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">Current Status</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Authentication", status: "Ready", desc: "Email + password signup & login" },
                { title: "Database", status: "Ready", desc: "Prisma + SQLite (switchable to Postgres)" },
                { title: "Photo Upload API", status: "Ready", desc: "Cloudinary support + local fallback" },
                { title: "Projects / Auto-create", status: "Ready", desc: "API for creating & auto-filling books" },
                { title: "Orders Model", status: "Ready", desc: "Database model prepared for payments" },
                { title: "Full Editor UI", status: "In Progress", desc: "Porting the drag-and-drop editor" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.status === "Ready"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm">
        Chola Chela Photography · Kitwe, Zambia · <a href="https://wa.me/260966080108" className="text-orange-700 hover:underline" target="_blank" rel="noreferrer">WhatsApp +260 966 080 108</a> · Production Platform
      <div className="mt-4 text-sm text-stone-500 space-y-1">
            <p>Email: <a href="mailto:cholachelaphotography@gmail.com" className="text-orange-700 underline">cholachelaphotography@gmail.com</a></p>
            <p>WhatsApp: <span className="text-stone-600">Add your number in settings</span></p>
            <p>Location: Kitwe, Zambia</p>
          </div>
        </footer>
    </div>
  );
}
