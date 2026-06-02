"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Download,
  FlaskConical,
  Play,
  Square,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import {
  analyzeStudySessions,
  createDemoStudySessions,
  exportStudyCsv,
  formatDuration,
  getActiveStudy,
  loadStudySessions,
  saveStudySessions,
  setActiveStudy,
  STUDY_TASKS,
  upsertStudySession,
  type StudyMethod,
  type StudySession,
} from "@/lib/study";

function newSessionId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function StudyPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [participantId, setParticipantId] = useState("U01");
  const [participantLabel, setParticipantLabel] = useState("");
  const [method, setMethod] = useState<StudyMethod>("system");
  const [taskId, setTaskId] = useState(1);
  const [running, setRunning] = useState<StudySession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [recipeInput, setRecipeInput] = useState("");
  const [tab, setTab] = useState<"run" | "results">("run");

  const refresh = useCallback(() => {
    setSessions(loadStudySessions());
    const active = getActiveStudy();
    if (active) {
      const stored = loadStudySessions().find((s) => s.id === active.sessionId);
      if (stored && !stored.completedAt) setRunning(stored);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!running?.startedAt || running.completedAt) return;
    const start = new Date(running.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const analysis = useMemo(() => analyzeStudySessions(sessions), [sessions]);

  function startSession() {
    if (!participantLabel.trim()) return;

    const session: StudySession = {
      id: newSessionId(),
      participantId: participantId.trim().toUpperCase(),
      participantLabel: participantLabel.trim(),
      method,
      taskId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationSec: null,
      success: false,
      recipesFound: [],
      notes: "",
    };

    upsertStudySession(session);
    setRunning(session);
    setElapsed(0);
    setRecipeInput("");
    refresh();

    if (method === "system") {
      setActiveStudy({
        sessionId: session.id,
        method: "system",
        taskId,
        startedAt: session.startedAt,
        recipesFound: [],
      });
      router.push("/search");
    }
  }

  function addRecipe() {
    if (!running || !recipeInput.trim()) return;
    const title = recipeInput.trim();
    if (
      running.recipesFound.some((r) => r.toLowerCase() === title.toLowerCase())
    ) {
      setRecipeInput("");
      return;
    }

    const next = {
      ...running,
      recipesFound: [...running.recipesFound, title],
    };
    upsertStudySession(next);
    setRunning(next);
    setRecipeInput("");
    refresh();
  }

  function finishSession(success: boolean) {
    if (!running) return;
    const end = Date.now();
    const start = new Date(running.startedAt).getTime();
    const completed: StudySession = {
      ...running,
      completedAt: new Date(end).toISOString(),
      durationSec: Math.round((end - start) / 1000),
      success: success && running.recipesFound.length >= 3,
    };
    upsertStudySession(completed);
    setActiveStudy(null);
    setRunning(null);
    setElapsed(0);
    refresh();
    setTab("results");
  }

  function loadDemo() {
    const existing = loadStudySessions().filter((s) => !s.isDemo);
    saveStudySessions([...existing, ...createDemoStudySessions()]);
    refresh();
    setTab("results");
  }

  function clearDemo() {
    saveStudySessions(loadStudySessions().filter((s) => !s.isDemo));
    refresh();
  }

  function downloadCsv() {
    const blob = new Blob([exportStudyCsv(sessions)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eatwell-study-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeTask = STUDY_TASKS.find(
    (t) => t.id === (running?.taskId ?? taskId),
  );

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#221C16]">
              Хэрэглэгчийн туршилт
            </h1>
            <p className="text-[13px] text-[#9C8878] mt-1">
              Жор олох хугацааг гараар (интернэт) vs системээр харьцуулна.
            </p>
          </div>

          <div className="flex gap-2">
            {(["run", "results"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={[
                  "px-4 py-2 rounded-xl text-[13px] font-semibold",
                  tab === key
                    ? "bg-[#B84230] text-white"
                    : "bg-white border border-[#D6C9B4] text-[#5C4A3A]",
                ].join(" ")}
              >
                {key === "run" ? "Туршилт явуулах" : "Үр дүн"}
              </button>
            ))}
          </div>

          {tab === "run" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white border border-[#D6C9B4]/60 rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-[#221C16]">Шинэ session</h2>
                <label className="block text-[12px] text-[#9C8878]">
                  Оролцогчийн код
                  <input
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#D6C9B4] text-[13px]"
                    placeholder="U01"
                  />
                </label>
                <label className="block text-[12px] text-[#9C8878]">
                  Оролцогч (нас)
                  <input
                    value={participantLabel}
                    onChange={(e) => setParticipantLabel(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#D6C9B4] text-[13px]"
                    placeholder="Болор, 24"
                  />
                </label>
                <div>
                  <p className="text-[12px] text-[#9C8878] mb-1">Арга</p>
                  <div className="flex gap-2">
                    {(["manual", "system"] as StudyMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={[
                          "flex-1 py-2 rounded-xl text-[12px] font-semibold border",
                          method === m
                            ? "bg-[#B84230] text-white border-[#B84230]"
                            : "bg-white text-[#5C4A3A] border-[#D6C9B4]",
                        ].join(" ")}
                      >
                        {m === "manual"
                          ? "Гараар (интернэт)"
                          : "Систем (Eatwell+)"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] text-[#9C8878] mb-1">Даалгавар</p>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D6C9B4] text-[13px]"
                  >
                    {STUDY_TASKS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}. {t.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[12px] text-[#5C4A3A] mt-2 leading-relaxed">
                    {STUDY_TASKS.find((t) => t.id === taskId)?.prompt}
                  </p>
                </div>
                {!running && (
                  <button
                    type="button"
                    onClick={startSession}
                    disabled={!participantLabel.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-[#B84230] text-white text-[13px] font-semibold disabled:opacity-50"
                  >
                    <Play size={16} /> Эхлүүлэх
                  </button>
                )}
              </div>

              <div className="bg-white border border-[#D6C9B4]/60 rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-[#221C16] flex items-center gap-2">
                  <Clock size={16} className="text-[#B84230]" />
                  Идэвхтэй session
                </h2>
                {!running ? (
                  <p className="text-[13px] text-[#9C8878]">
                    Session эхлээгүй байна.
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-[#9C8878]">
                      {running.participantLabel} ·{" "}
                      {running.method === "manual" ? "Гараар" : "Систем"} ·{" "}
                      {activeTask?.title}
                    </p>
                    <p className="font-display text-4xl font-semibold text-[#221C16]">
                      {formatDuration(elapsed)}
                    </p>
                    {running.method === "system" && (
                      <Link
                        href="/search"
                        className="inline-block text-[12px] font-semibold text-[#B84230] hover:underline"
                      >
                        → Хайлт руу очих (жор нээхэд автоматаар тоолно)
                      </Link>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={recipeInput}
                        onChange={(e) => setRecipeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRecipe()}
                        placeholder="Олсон жорын нэр..."
                        className="flex-1 px-3 py-2 rounded-xl border border-[#D6C9B4] text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={addRecipe}
                        className="px-3 py-2 rounded-xl bg-[#FBF0E6] text-[#B84230] text-[12px] font-semibold"
                      >
                        +1
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {running.recipesFound.map((r, i) => (
                        <li key={r} className="text-[13px] text-[#221C16]">
                          {i + 1}. {r}
                        </li>
                      ))}
                      {running.recipesFound.length < 3 && (
                        <li className="text-[12px] text-[#9C8878]">
                          {3 - running.recipesFound.length} жор үлдсэн
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      onClick={() =>
                        finishSession(running.recipesFound.length >= 3)
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                 bg-[#221C16] text-white text-[13px] font-semibold"
                    >
                      <Square size={14} /> Дуусгах
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "results" && (
            <div className="space-y-4">
              <div
                className={[
                  "rounded-2xl border p-5",
                  analysis.meetsTarget
                    ? "bg-[#F0FDF4] border-[#86EFAC]"
                    : "bg-[#FFFBEB] border-[#FCD34D]",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  {analysis.meetsTarget ? (
                    <CheckCircle2
                      className="text-[#16A34A] shrink-0"
                      size={22}
                    />
                  ) : (
                    <AlertTriangle
                      className="text-[#D97706] shrink-0"
                      size={22}
                    />
                  )}
                  <div>
                    <p className="font-semibold text-[#221C16]">
                      Дундаж бууралт: {analysis.reductionPct.toFixed(1)}%
                      {analysis.meetsTarget
                        ? " (40%-иас дээш — баталгаажсан)"
                        : " (10 бодит оролцогч шаардлагатай)"}
                    </p>
                    <p className="text-[13px] text-[#5C4A3A] mt-1">
                      Гараар:{" "}
                      {formatDuration(Math.round(analysis.manualMeanSec))} ·
                      Систем:{" "}
                      {formatDuration(Math.round(analysis.systemMeanSec))} ·
                      Оролцогч: {analysis.participantCount} · Бодит session:{" "}
                      {analysis.realSessions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D6C9B4] text-[13px] font-semibold"
                >
                  <Download size={15} /> CSV татах
                </button>
                <button
                  type="button"
                  onClick={loadDemo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBF0E6] border border-[#E8C4A0] text-[13px] font-semibold text-[#B85E1A]"
                >
                  <FlaskConical size={15} /> 5 жишээ pilot ачаалах
                </button>
                <button
                  type="button"
                  onClick={clearDemo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D6C9B4] text-[13px] text-[#9C8878]"
                >
                  <Trash2 size={15} /> Жишээг устгах
                </button>
              </div>

              <p className="text-[11px] text-[#9C8878]">
                «5 жишээ pilot» нь зөвхөн формат харуулах зориулалттай. Дiplom-д
                бодит 10+ оролцогчийн өгөгдөл оруулна уу.
              </p>

              <div className="bg-white border border-[#D6C9B4]/60 rounded-2xl overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#FAF7F0] text-[#9C8878] uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-3 py-2">Оролцогч</th>
                      <th className="text-left px-3 py-2">Даалгавар</th>
                      <th className="text-left px-3 py-2">Гараар</th>
                      <th className="text-left px-3 py-2">Систем</th>
                      <th className="text-left px-3 py-2">Бууралт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.pairedRows.map((row) => {
                      const drop =
                        row.manualSec != null &&
                        row.systemSec != null &&
                        row.manualSec > 0
                          ? ((row.manualSec - row.systemSec) / row.manualSec) *
                            100
                          : null;
                      return (
                        <tr
                          key={`${row.participantId}-${row.taskId}`}
                          className="border-t border-[#EFE8DA]"
                        >
                          <td className="px-3 py-2">{row.participantLabel}</td>
                          <td className="px-3 py-2">{row.taskId}</td>
                          <td className="px-3 py-2">
                            {formatDuration(row.manualSec)}
                          </td>
                          <td className="px-3 py-2">
                            {formatDuration(row.systemSec)}
                          </td>
                          <td className="px-3 py-2">
                            {drop != null ? `${drop.toFixed(0)}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-[#D6C9B4]/60 rounded-2xl overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#FAF7F0] text-[#9C8878] uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-3 py-2">ID</th>
                      <th className="text-left px-3 py-2">Арга</th>
                      <th className="text-left px-3 py-2">Task</th>
                      <th className="text-left px-3 py-2">Хугацаа</th>
                      <th className="text-left px-3 py-2">Demo?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-t border-[#EFE8DA]">
                        <td className="px-3 py-2">{s.participantLabel}</td>
                        <td className="px-3 py-2">{s.method}</td>
                        <td className="px-3 py-2">{s.taskId}</td>
                        <td className="px-3 py-2">
                          {formatDuration(s.durationSec)}
                        </td>
                        <td className="px-3 py-2">
                          {s.isDemo ? "тийм" : "үгүй"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
