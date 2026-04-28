export function CtaBanner() {
  return (
    <section className="py-20 px-6 bg-white border-t border-chimge-line">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chimge-primary-soft text-chimge-primary text-[12px] font-semibold mb-6">
          Төгсөлтийн ажил
        </div>
        <h2 className="font-serif-display text-[40px] font-semibold text-chimge-ink mb-4 leading-tight">
          EatWell+ платформыг туршиж үзэх үү?
        </h2>
        <p className="text-[15px] text-chimge-ink-2 mb-8 leading-relaxed">
          Бүртгүүлэх нь үнэгүй. Хэрэглэгч эсвэл хоолны технологичоор нэвтэрч,
          систем бүрэн ажиллаж байгааг шалгана уу.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-8 py-4 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[15px] font-semibold hover:bg-chimge-primary-dk transition-colors shadow-lg shadow-chimge-primary/25">
            Хэрэглэгчээр бүртгүүлэх
          </button>
          <button className="px-8 py-4 rounded-xl border border-chimge-line bg-chimge-bg text-[15px] font-semibold text-chimge-ink-2 hover:bg-chimge-sage-soft hover:text-chimge-sage transition-colors">
            Технологичоор нэвтрэх
          </button>
        </div>
      </div>
    </section>
  );
}
