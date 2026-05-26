"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ShoppingBag,
  MessageSquare,
  Wallet,
  BookOpen,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@/context/UserContext";
import {
  technologistApi,
  type TechnologistAnalytics,
} from "@/lib/technologist";

const numberFormat = new Intl.NumberFormat("mn-MN");
const moneyFormat = new Intl.NumberFormat("mn-MN");

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  tone = "default",
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  suffix?: string;
  tone?: "default" | "money" | "good";
}) {
  const colors =
    tone === "money"
      ? "bg-[#FBF0E6] text-[#B84230] border-[#E8C4A0]"
      : tone === "good"
        ? "bg-[#E8F0EC] text-[#2D5A4A] border-[#B8D1C5]"
        : "bg-white text-[#221C16] border-[#D6C9B4]";

  return (
    <div className={`rounded-2xl border p-4 ${colors}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="opacity-70" />
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
          {label}
        </span>
      </div>
      <div className="font-display text-[24px] font-semibold leading-none">
        {value}
        {suffix && (
          <span className="text-[13px] font-medium ml-1 opacity-70">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TechnologistAnalyticsPage() {
  const router = useRouter();
  const user = useUser();
  const [data, setData] = useState<TechnologistAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "technologist" && user.role !== "admin") {
      router.replace("/home");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await technologistApi.getAnalytics();
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError("Аналитик татахад алдаа гарлаа.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || (user.role !== "technologist" && user.role !== "admin")) {
    return null;
  }

  const totals = data?.totals ?? {
    recipes: 0,
    published: 0,
    views: 0,
    purchases: 0,
    revenue: 0,
    comments: 0,
  };

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                     border-b border-[#D6C9B4]/70 py-3 px-3 sm:px-4 md:px-8
                     pl-14 sm:pl-4 md:pl-8 flex flex-wrap items-center gap-3"
        >
          <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#221C16]">
            Аналитик
          </h1>
          <Link
            href="/my-recipes"
            className="ml-auto text-[12px] font-semibold text-[#5C4A3A] hover:text-[#B84230]
                       transition-colors"
          >
            Миний жорууд →
          </Link>
        </header>

        <main className="px-3 sm:px-4 md:px-8 py-6 space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-[#FBF0E6] border border-[#B84230]/20
                           text-[#B84230] text-[13px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-[#D6C9B4]/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <section>
                <h2 className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-3">
                  Нийт үзүүлэлт
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <StatCard
                    icon={BookOpen}
                    label="Нийт жор"
                    value={numberFormat.format(totals.recipes)}
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Нийтлэгдсэн"
                    value={numberFormat.format(totals.published)}
                    tone="good"
                  />
                  <StatCard
                    icon={Eye}
                    label="Нийт үзэлт"
                    value={numberFormat.format(totals.views)}
                  />
                  <StatCard
                    icon={ShoppingBag}
                    label="Худалдан авалт"
                    value={numberFormat.format(totals.purchases)}
                  />
                  <StatCard
                    icon={MessageSquare}
                    label="Сэтгэгдэл"
                    value={numberFormat.format(totals.comments)}
                  />
                  <StatCard
                    icon={Wallet}
                    label="Орлого"
                    value={moneyFormat.format(totals.revenue)}
                    suffix="₮"
                    tone="money"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-3">
                  Жор тус бүрийн гүйцэтгэл
                </h2>

                {(data?.items.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-[#D6C9B4] bg-white p-8 text-center">
                    <FileText
                      size={32}
                      className="mx-auto text-[#9C8878] mb-3"
                    />
                    <p className="text-sm text-[#5C4A3A] mb-4">
                      Та одоогоор жор оруулаагүй байна.
                    </p>
                    <Link
                      href="/new-recipe"
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-[#B84230]
                                 text-white text-[13px] font-semibold hover:bg-[#9C3426]
                                 transition-colors"
                    >
                      Эхний жороо нэмэх
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-[#D6C9B4] bg-white">
                    <table className="w-full text-[13px]">
                      <thead className="bg-[#EFE8DA] text-[11px] font-bold uppercase tracking-wider text-[#9C8878]">
                        <tr>
                          <th className="text-left px-4 py-3">Жор</th>
                          <th className="text-right px-3 py-3">Төлөв</th>
                          <th className="text-right px-3 py-3">Үзэлт</th>
                          <th className="text-right px-3 py-3">Сэтгэгдэл</th>
                          <th className="text-right px-3 py-3">Худалдан авалт</th>
                          <th className="text-right px-4 py-3">Орлого</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE8DA]">
                        {data?.items.map((r) => (
                          <tr key={r._id} className="hover:bg-[#FBF0E6]/40">
                            <td className="px-4 py-3">
                              <Link
                                href={`/recipes/${r._id}`}
                                className="font-medium text-[#221C16] hover:text-[#B84230]
                                           transition-colors line-clamp-1"
                              >
                                {r.title}
                              </Link>
                            </td>
                            <td className="text-right px-3 py-3">
                              {r.isDraft ? (
                                <span className="text-[11px] font-semibold text-[#9C8878]">
                                  Ноорог
                                </span>
                              ) : r.isPremium ? (
                                <span className="text-[11px] font-semibold text-[#B84230]">
                                  Премиум
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-[#2D5A4A]">
                                  Нийтэлсэн
                                </span>
                              )}
                            </td>
                            <td className="text-right px-3 py-3 font-medium text-[#221C16]">
                              {numberFormat.format(r.views)}
                            </td>
                            <td className="text-right px-3 py-3 font-medium text-[#221C16]">
                              {numberFormat.format(r.comments)}
                            </td>
                            <td className="text-right px-3 py-3 font-medium text-[#221C16]">
                              {numberFormat.format(r.purchases)}
                            </td>
                            <td className="text-right px-4 py-3 font-medium text-[#B84230]">
                              {r.revenue > 0
                                ? `${moneyFormat.format(r.revenue)} ₮`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
