import Link from "next/link";

/** Change this to your main photography website URL */
const PHOTOGRAPHY_SITE_URL =
  process.env.NEXT_PUBLIC_PHOTOGRAPHY_SITE_URL ||
  "https://cholachela.com";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold">
              CC
            </div>
            <div>
              <div className="font-semibold text-stone-900 leading-tight">
                Chola Chela
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-700">
                Photo Book Studio
              </div>
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
              Create account
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-stone-100">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-700 mb-3">
                Kitwe, Zambia
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-5">
                Chola Chela Photo Book Studio
              </h1>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Professional photo book and photo album design and printing.
                Upload your photos, design a beautiful book online, choose your
                materials, and order print-ready albums — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-orange-700 text-white font-semibold hover:bg-orange-800 transition"
                >
                  Start your photo book
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-full border border-stone-300 text-stone-800 font-semibold hover:border-orange-400 hover:text-orange-800 transition"
                >
                  Log in to your studio
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Photo books &amp; printing
          </h2>
          <p className="text-stone-600 mb-10 max-w-2xl">
            This platform is built for designing, ordering and printing custom
            photo books and albums — not for browsing a general portfolio site.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Custom photo book design",
                body: "Choose templates, arrange your photos, zoom and position each image, and personalise the cover.",
              },
              {
                title: "Professional printing",
                body: "Submit your finished book for high-quality printing with clear order tracking.",
              },
              {
                title: "Materials & finishes",
                body: "Select materials and cover types so pricing matches the finish you want.",
              },
              {
                title: "Photo albums",
                body: "Create lasting albums for weddings, families, graduations and special moments.",
              },
              {
                title: "Order online",
                body: "Design in your account, review the total, then pay now or pay later for admin confirmation.",
              },
              {
                title: "Related print services",
                body: "Photo book production sits alongside our wider photographic print offering.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-stone-200 p-5"
              >
                <h3 className="font-semibold text-stone-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-y border-stone-100">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">
              How it works
            </h2>
            <ol className="grid md:grid-cols-4 gap-6">
              {[
                "Create a free account",
                "Upload your photos",
                "Design your book",
                "Order and print",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-sm">
                    {i + 1}
                  </span>
                  <span className="font-medium text-stone-800 pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Other photography services */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-3">Other photography services</h2>
            <p className="text-stone-300 mb-4 max-w-2xl leading-relaxed">
              In addition to photo books and printing, Chola Chela also provides
              professional photography for weddings, kitchen parties, Ichilanga
              Mulilo, bridal showers, family and portrait sessions, graduations,
              maternity, baby, corporate and other special events.
            </p>
            <p className="text-stone-400 text-sm mb-6 max-w-2xl">
              Full photography packages and portfolios are on our dedicated
              photography website. This site stays focused on photo books,
              albums and printing.
            </p>
            <a
              href={PHOTOGRAPHY_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-6 py-3 rounded-full bg-white text-stone-900 font-semibold hover:bg-orange-50 transition"
            >
              Explore photography services
            </a>
          </div>
        </section>
      </main>

      {/* Footer / contact — single WhatsApp */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <div className="font-semibold text-stone-900">
                Chola Chela Photo Book Studio
              </div>
              <p className="text-sm text-stone-500 mt-1">
                Photo book design, albums &amp; professional printing · Kitwe,
                Zambia
              </p>
            </div>
            <div className="text-sm text-stone-600 space-y-2">
              <p>
                <span className="text-stone-400">Email: </span>
                <a
                  href="mailto:cholachelaphotography@gmail.com"
                  className="text-orange-700 hover:underline"
                >
                  cholachelaphotography@gmail.com
                </a>
              </p>
              <p>
                <span className="text-stone-400">WhatsApp: </span>
                <a
                  href="https://wa.me/260966080108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:underline"
                >
                  +260 966 080 108
                </a>
              </p>
              <p className="text-stone-500">Kitwe, Zambia</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-orange-700"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-orange-700 hover:underline"
              >
                Create account
              </Link>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-8">
            © {new Date().getFullYear()} Chola Chela Photography. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
