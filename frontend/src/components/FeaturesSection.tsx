import {
  ScanLine,
  Heart,
  CalendarDays,
  ShoppingBasket,
  BadgeCheck,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: BadgeCheck,
    color: "bg-chimge-sage-soft text-chimge-sage",
    title: "Хоолны технологичид",
    desc: "Мэргэжлийн хоолны технологичид баталгаажсан тэмдэгтэйгээр жор нийтэлж, мэдлэгээ хуваалцана.",
  },
  {
    icon: Star,
    color: "bg-chimge-gold-soft text-chimge-gold",
    title: "Premium жорын систем",
    desc: "Онцгой жоруудыг Premium хэлбэрээр нийтлэх боломжтой. Технологичид өөрийн жорыг худалдаалж орлого олно.",
  },
  {
    icon: Heart,
    color: "bg-chimge-warn-soft text-chimge-warn",
    title: "Харшилд суурилсан шүүлт",
    desc: "Хэрэглэгч өөрийн харшилтай орцуудаа бүртгэснээр аюулгүй жоруудыг автоматаар шүүж үзүүлнэ.",
  },
  {
    icon: ScanLine,
    color: "bg-chimge-primary-soft text-chimge-primary",
    title: "Баркод скан",
    desc: "Дэлгүүрийн бараагаа камераар скан хийгээд тухайн орцыг ашигласан жоруудыг нэн даруй хар.",
  },
  {
    icon: CalendarDays,
    color: "bg-chimge-gold-soft text-chimge-gold",
    title: "7 хоногийн төлөвлөгөө",
    desc: "Долоо хоногийн хоолны цагийн хуваарийг урьдчилан гаргаж, жигд хооллох хэвшил тогтоо.",
  },
  {
    icon: ShoppingBasket,
    color: "bg-chimge-sage-soft text-chimge-sage",
    title: "Автомат дэлгүүрийн жагсаалт",
    desc: "Жор сонгоход зайлшгүй орцуудын жагсаалт автоматаар үүсч, дэлгүүрт явах цагаа хэмнэнэ.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chimge-sage-soft text-chimge-sage text-[12px] font-semibold mb-4">
            Судалгааны үр дүнд суурилсан
          </div>
          <h2 className="font-serif-display text-[38px] font-semibold text-chimge-ink mb-3">
            EatWell+ платформын{" "}
            <span className="text-chimge-primary italic">гол онцлогууд</span>
          </h2>
          <p className="text-[15px] text-chimge-ink-3 max-w-[500px] mx-auto leading-relaxed">
            Монголын хэрэглэгчдийн хэрэгцээ, хоолны технологичдын мэдлэгийг
            нэгтгэсэн иж бүрэн шийдэл.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-5 rounded-2xl border border-chimge-line bg-chimge-bg hover:border-chimge-primary/30 hover:shadow-md transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-[15px] text-chimge-ink mb-1.5">
                  {f.title}
                </h3>
                <p className="text-[13px] text-chimge-ink-3 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
