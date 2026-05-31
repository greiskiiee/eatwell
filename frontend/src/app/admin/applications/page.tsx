/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/admin";
import { certificateImageUrl } from "@/lib/recipes";
import type { ApprovalApplication } from "@/lib/types-admin";

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<ApprovalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listApplications("pending");
      setApps(data);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(userId: string, action: "approve" | "reject") {
    await adminApi.reviewApplication(
      userId,
      action,
      action === "reject" ? rejectReason[userId] : undefined,
    );
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#221C16]">
          Хүнсний технологичийн бүртгэлийн хүсэлт
        </h2>
        <p className="text-sm text-[#9C8878] mt-1">
          Баталгаажуулах баримт шалгаж зөвшөөрөх эсвэл татгалзана. Шийдвэрийг
          и-мэйлээр илгээнэ.
        </p>
      </div>

      {loading ? (
        <p className="text-[#9C8878]">Ачаалж байна...</p>
      ) : apps.length === 0 ? (
        <p className="text-[#9C8878]">Хүлээгдэж буй хүсэлт байхгүй</p>
      ) : (
        <ul className="space-y-4">
          {apps.map((app) => (
            <li
              key={app.userId}
              className="bg-white rounded-2xl border border-[#D6C9B4]/70 p-5 space-y-3"
            >
              <div>
                <p className="font-semibold text-[#221C16]">{app.name}</p>
                <p className="text-sm text-[#5C4A3A]">{app.email}</p>
                {app.credentials && (
                  <p className="text-xs text-[#9C8878]">{app.credentials}</p>
                )}
              </div>
              {app.certificateUrl && (
                <a
                  href={certificateImageUrl(app.certificateUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#2D5A4A] font-semibold hover:underline"
                >
                  Баталгаа харах →
                </a>
              )}
              <input
                placeholder="Татгалзах шалтгаан (заавал биш)"
                value={rejectReason[app.userId] ?? ""}
                onChange={(e) =>
                  setRejectReason((prev) => ({
                    ...prev,
                    [app.userId]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D6C9B4] text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => review(app.userId, "approve")}
                  className="flex-1 py-2 rounded-xl bg-[#2D5A4A] text-white text-sm font-semibold"
                >
                  Зөвшөөрөх
                </button>
                <button
                  type="button"
                  onClick={() => review(app.userId, "reject")}
                  className="flex-1 py-2 rounded-xl border border-[#B84230] text-[#B84230] text-sm font-semibold"
                >
                  Татгалзах
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
