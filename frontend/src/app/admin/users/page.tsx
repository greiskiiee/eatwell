/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/admin";
import type { AdminUserRow } from "@/lib/types-admin";

const ROLE_LABELS: Record<string, string> = {
  all: "Бүгд",
  user: "Хэрэглэгч",
  technologist: "Технолог",
  admin: "Админ",
};

const ROLE_BADGE: Record<string, string> = {
  user: "bg-[#EFE8DA] text-[#5C4A3A]",
  technologist: "bg-[#EDF5F0] text-[#2D5A4A]",
  admin: "bg-[#B84230]/12 text-[#B84230]",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        q: debouncedQ || undefined,
        role,
        limit: 100,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, role]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#221C16]">
          Хэрэглэгчид
        </h2>
        <p className="text-sm text-[#9C8878] mt-1">
          Нийт {total} идэвхтэй хэрэглэгч
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Нэр эсвэл и-мэйлээр хайх..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D6C9B4] text-sm bg-white
                       focus:border-[#B84230] focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#D6C9B4] text-sm bg-white
                     focus:border-[#B84230] focus:outline-none min-w-[140px]"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#D6C9B4]/70 overflow-hidden">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-[#9C8878]">
            Ачаалж байна...
          </p>
        ) : users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#9C8878]">
            Хэрэглэгч олдсонгүй
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAF7F0] text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                  <th className="px-5 py-3">Хэрэглэгч</th>
                  <th className="px-5 py-3 hidden md:table-cell">И-мэйл</th>
                  <th className="px-5 py-3">Эрх</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Бүртгэсэн</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DA]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7F0]/60">
                    <td className="px-5 py-3.5 font-semibold text-[#221C16]">
                      {u.name || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#5C4A3A] hidden md:table-cell">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ROLE_BADGE[u.role] ?? ROLE_BADGE.user
                        }`}
                      >
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#9C8878] hidden sm:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
