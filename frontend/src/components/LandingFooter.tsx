const LINKS = {
  Платформ: ["Жорууд", "Технологичид", "Premium", "Баркод скан"],

  Холбогдох: ["+976 80348383", "chimgeebatuh@gmail.com", "Улаанбаатар, Монгол"],
};

export function LandingFooter() {
  return (
    <footer className="bg-chimge-ink text-white/70 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif-display text-[24px] font-semibold">
              <span className="text-white">EatWell</span>
              <span className="text-chimge-primary">+</span>
            </span>
            <p className="text-[13px] mt-3 leading-relaxed max-w-50">
              Монголын хоолны жор хуваалцах веб платформ.
            </p>
            <div className="mt-4 text-[11px] text-white/40 border border-white/10 rounded-lg px-3 py-2 inline-block">
              Next.js · Express · MongoDB
            </div>
          </div>
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[11px] font-bold text-white uppercase tracking-[0.7px] mb-4">
                {group}
              </div>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13px] hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-[12px]">
          <span>© 2026 EatWell+ · Дипломын ажил · МХТС</span>
          <span>🇲🇳 Монгол Улс</span>
        </div>
      </div>
    </footer>
  );
}
