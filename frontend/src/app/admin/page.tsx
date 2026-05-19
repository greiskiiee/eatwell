/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bookmark,
  ChefHat,
  ClipboardList,
  Languages,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/admin";
import type { AdminStats } from "@/lib/types-admin";
import { StatCard } from "@/components/admin/StatCard";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ROLE_LABELS: Record<string, string> = {
  user: "Хэрэглэгч",
  technologist: "Технолог",
  admin: "Админ",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch {
      setError("Статистик ачаалж чадсангүй");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#D6C9B4]/40 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white/60 border border-[#D6C9B4]/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-2xl border border-[#D6C9B4]/70 p-8 text-center">
        <p className="text-[#9C8878] mb-4">{error ?? "Мэдээлэл олдсонгүй"}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B84230] text-white text-sm font-semibold"
        >
          <RefreshCw size={14} />
          Дахин оролдох
        </button>
      </div>
    );
  }

  const translationPct =
    stats.ingredients.total > 0
      ? Math.round(
          ((stats.ingredients.total - stats.ingredients.untranslated) /
            stats.ingredients.total) *
            100,
        )
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#221C16]">
            Хяналтын самбар
          </h2>
          <p className="text-sm text-[#9C8878] mt-1">
            Eatwell+ платформын ерөнхий үзүүлэлт, хүсэлт, хэрэглэгчид
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#D6C9B4]
                     bg-white text-[13px] font-semibold text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors shrink-0"
        >
          <RefreshCw size={14} />
          Шинэчлэх
        </button>
      </div>

      <section>
        <h3 className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-3">
          Үндсэн үзүүлэлт
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Нийт хэрэглэгч"
            value={stats.users.total}
            hint={`${stats.users.regular} энгийн · ${stats.users.technologists} технолог`}
            icon={Users}
            tone="brand"
          />
          <StatCard
            label="Хүлээгдэж буй хүсэлт"
            value={stats.applications.pending}
            hint={`${stats.applications.approved} зөвшөөрсөн`}
            icon={ClipboardList}
            tone={stats.applications.pending > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Технологийн жор"
            value={stats.recipes.total}
            hint={`${stats.recipes.published} нийтэлсэн · ${stats.recipes.drafts} ноорог`}
            icon={ChefHat}
            tone="success"
          />
          <StatCard
            label="Орц орчуулга"
            value={`${translationPct}%`}
            hint={`${stats.ingredients.untranslated} орчуулаагүй / ${stats.ingredients.total}`}
            icon={Languages}
            tone={stats.ingredients.untranslated > 50 ? "warning" : "default"}
          />
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-3">
          Идэвхжил
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Сэтгэгдэл"
            value={stats.engagement.comments}
            icon={MessageSquare}
          />
          <StatCard
            label="Хадгалсан жор"
            value={stats.engagement.savedRecipes}
            icon={Bookmark}
          />
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-3">
          Түргэн үйлдэл
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/applications"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#D6C9B4]/70
                       hover:border-[#B84230] hover:shadow-sm transition-all"
          >
            <span className="w-10 h-10 rounded-xl bg-[#FBF0E6] text-[#B85E1A] flex items-center justify-center">
              <UserCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#221C16]">Хүсэлт шалгах</p>
              <p className="text-[12px] text-[#9C8878]">
                {stats.applications.pending} хүлээгдэж байна
              </p>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#D6C9B4]/70
                       hover:border-[#B84230] hover:shadow-sm transition-all"
          >
            <span className="w-10 h-10 rounded-xl bg-[#EFE8DA] text-[#5C4A3A] flex items-center justify-center">
              <Users size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#221C16]">Хэрэглэгчид</p>
              <p className="text-[12px] text-[#9C8878]">
                {stats.users.total} бүртгэлтэй
              </p>
            </div>
          </Link>
          <Link
            href="/admin/ingredients"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#D6C9B4]/70
                       hover:border-[#B84230] hover:shadow-sm transition-all"
          >
            <span className="w-10 h-10 rounded-xl bg-[#EDF5F0] text-[#2D5A4A] flex items-center justify-center">
              <Languages size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#221C16]">Орц орчуулах</p>
              <p className="text-[12px] text-[#9C8878]">
                {stats.ingredients.untranslated} үлдсэн
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-[#D6C9B4]/70 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE8DA]">
            <h3 className="font-semibold text-[#221C16]">Сүүлийн хүсэлтүүд</h3>
            <Link
              href="/admin/applications"
              className="text-[12px] font-semibold text-[#B84230] hover:underline"
            >
              Бүгдийг харах →
            </Link>
          </div>
          {stats.recentApplications.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#9C8878] text-center">
              Хүлээгдэж буй хүсэлт байхгүй
            </p>
          ) : (
            <ul className="divide-y divide-[#EFE8DA]">
              {stats.recentApplications.map((app) => (
                <li key={app.userId} className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-[#221C16]">{app.name}</p>
                  <p className="text-[12px] text-[#5C4A3A]">{app.email}</p>
                  <p className="text-[11px] text-[#9C8878] mt-0.5 truncate">
                    {app.credentials || "—"} · {formatDate(app.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-[#D6C9B4]/70 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE8DA]">
            <h3 className="font-semibold text-[#221C16]">Шинэ хэрэглэгчид</h3>
            <Link
              href="/admin/users"
              className="text-[12px] font-semibold text-[#B84230] hover:underline"
            >
              Бүгдийг харах →
            </Link>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#9C8878] text-center">
              Хэрэглэгч байхгүй
            </p>
          ) : (
            <ul className="divide-y divide-[#EFE8DA]">
              {stats.recentUsers.map((u) => (
                <li
                  key={u.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#221C16] truncate">
                      {u.name || u.email}
                    </p>
                    <p className="text-[12px] text-[#5C4A3A] truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase text-[#B84230] bg-[#B84230]/10 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    <p className="text-[11px] text-[#9C8878] mt-1">
                      {formatDate(u.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
