export type StudyMethod = "manual" | "system";

export type StudyTask = {
  id: number;
  title: string;
  prompt: string;
  hint?: string;
  searchPath?: string;
};

export type StudySession = {
  id: string;
  participantId: string;
  participantLabel: string;
  method: StudyMethod;
  taskId: number;
  startedAt: string;
  completedAt: string | null;
  durationSec: number | null;
  success: boolean;
  recipesFound: string[];
  notes: string;
  isDemo?: boolean;
};

export const STUDY_STORAGE_KEY = "eatwell_study_sessions_v1";
export const STUDY_ACTIVE_KEY = "eatwell_study_active_v1";

export type ActiveStudy = {
  sessionId: string;
  method: StudyMethod;
  taskId: number;
  startedAt: string;
  recipesFound: string[];
};

export const STUDY_TASKS: StudyTask[] = [
  {
    id: 1,
    title: "Тахиа + будаа",
    prompt:
      "Танд гэрт тахианы мах, будаа байна. Тохирох 3 жор олж, нэрсийг тэмдэглэнэ үү.",
    hint: "Орц: Chicken, Rice",
    searchPath: "/search",
  },
  {
    id: 2,
    title: "Өндөг + ногоо",
    prompt:
      "Танд өндөг, улаан лооль байна. 3 тохирох жор олно уу.",
    hint: "Орц: Eggs, Tomato",
    searchPath: "/search",
  },
  {
    id: 3,
    title: "15 минутын хоол",
    prompt:
      "15 минутаас богино хугацаанд бэлтгэж болох 3 жор олно уу.",
    hint: "Хугацааны шүүлтүүр ≤ 15 мин",
    searchPath: "/search",
  },
];

export function loadStudySessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudySession[];
  } catch {
    return [];
  }
}

export function saveStudySessions(sessions: StudySession[]) {
  localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(sessions));
}

export function upsertStudySession(session: StudySession) {
  const all = loadStudySessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  saveStudySessions(all);
}

export function getActiveStudy(): ActiveStudy | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STUDY_ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ActiveStudy) : null;
  } catch {
    return null;
  }
}

export function setActiveStudy(active: ActiveStudy | null) {
  if (active) {
    sessionStorage.setItem(STUDY_ACTIVE_KEY, JSON.stringify(active));
  } else {
    sessionStorage.removeItem(STUDY_ACTIVE_KEY);
  }
}

export function recordStudyRecipe(recipeTitle: string) {
  const active = getActiveStudy();
  if (!active || active.method !== "system") return;

  const title = recipeTitle.trim();
  if (!title) return;
  if (active.recipesFound.some((r) => r.toLowerCase() === title.toLowerCase())) {
    return;
  }

  active.recipesFound = [...active.recipesFound, title];
  setActiveStudy(active);

  const sessions = loadStudySessions();
  const session = sessions.find((s) => s.id === active.sessionId);
  if (!session || session.completedAt) return;

  session.recipesFound = active.recipesFound;
  if (active.recipesFound.length >= 3) {
    const end = Date.now();
    const start = new Date(active.startedAt).getTime();
    session.completedAt = new Date(end).toISOString();
    session.durationSec = Math.round((end - start) / 1000);
    session.success = true;
    setActiveStudy(null);
  }
  upsertStudySession(session);
}

export type StudyAnalysis = {
  realSessions: StudySession[];
  demoSessions: StudySession[];
  manualMeanSec: number;
  systemMeanSec: number;
  reductionPct: number;
  meetsTarget: boolean;
  participantCount: number;
  pairedRows: {
    participantId: string;
    participantLabel: string;
    taskId: number;
    manualSec: number | null;
    systemSec: number | null;
  }[];
};

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function analyzeStudySessions(sessions: StudySession[]): StudyAnalysis {
  const completed = sessions.filter((s) => s.completedAt && s.durationSec != null);
  const realSessions = completed.filter((s) => !s.isDemo);
  const demoSessions = completed.filter((s) => s.isDemo);

  const analysisSet =
    realSessions.length >= 10
      ? realSessions
      : realSessions.length > 0
        ? realSessions
        : demoSessions;

  const manualTimes = analysisSet
    .filter((s) => s.method === "manual")
    .map((s) => s.durationSec!);
  const systemTimes = analysisSet
    .filter((s) => s.method === "system")
    .map((s) => s.durationSec!);

  const manualMeanSec = mean(manualTimes);
  const systemMeanSec = mean(systemTimes);
  const reductionPct =
    manualMeanSec > 0 ? ((manualMeanSec - systemMeanSec) / manualMeanSec) * 100 : 0;

  const participants = new Set(analysisSet.map((s) => s.participantId));
  const pairedRows: StudyAnalysis["pairedRows"] = [];

  for (const participantId of participants) {
    for (const task of STUDY_TASKS) {
      const manual = analysisSet.find(
        (s) =>
          s.participantId === participantId &&
          s.taskId === task.id &&
          s.method === "manual",
      );
      const system = analysisSet.find(
        (s) =>
          s.participantId === participantId &&
          s.taskId === task.id &&
          s.method === "system",
      );
      pairedRows.push({
        participantId,
        participantLabel:
          manual?.participantLabel ?? system?.participantLabel ?? participantId,
        taskId: task.id,
        manualSec: manual?.durationSec ?? null,
        systemSec: system?.durationSec ?? null,
      });
    }
  }

  return {
    realSessions,
    demoSessions,
    manualMeanSec,
    systemMeanSec,
    reductionPct,
    meetsTarget: reductionPct >= 40 && realSessions.length >= 10,
    participantCount: participants.size,
    pairedRows: pairedRows.sort(
      (a, b) =>
        a.participantLabel.localeCompare(b.participantLabel) ||
        a.taskId - b.taskId,
    ),
  };
}

export function exportStudyCsv(sessions: StudySession[]): string {
  const header =
    "participant_id,participant_label,method,task_id,duration_sec,success,recipes,is_demo,notes";
  const rows = sessions.map((s) =>
    [
      s.participantId,
      `"${s.participantLabel.replace(/"/g, '""')}"`,
      s.method,
      s.taskId,
      s.durationSec ?? "",
      s.success ? "yes" : "no",
      `"${s.recipesFound.join("; ").replace(/"/g, '""')}"`,
      s.isDemo ? "yes" : "no",
      `"${s.notes.replace(/"/g, '""')}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function demoDuration(method: StudyMethod, seed: number): number {
  const base = method === "manual" ? 520 : 240;
  const jitter = (seed * 37) % 180;
  return base + jitter;
}

/** Pilot examples for UI/testing only — NOT real participant data. */
export function createDemoStudySessions(): StudySession[] {
  const people = [
    { id: "U01", label: "Болортуяа, 24" },
    { id: "U02", label: "Энхманлай, 31" },
    { id: "U03", label: "Сараа, 22" },
    { id: "U04", label: "Тэмүүлэн, 28" },
    { id: "U05", label: "Оюунбилэг, 26" },
  ];

  const recipeSets: Record<number, { manual: string[]; system: string[] }> = {
    1: {
      manual: ["Chicken Fried Rice", "Jerk chicken with rice", "Kung Pao Chicken"],
      system: ["Chicken Handi", "Brown Stew Chicken", "Chicken Congee"],
    },
    2: {
      manual: ["Shakshuka", "Tomato omelette", "Menemen"],
      system: ["Egg Drop Soup", "Stovetop Eggplant", "Spanish tortilla"],
    },
    3: {
      manual: ["Quick pasta", "Avocado toast", "Stir fry noodles"],
      system: ["15-minute chicken burgers", "Quick teriyaki", "Fast fried rice"],
    },
  };

  const sessions: StudySession[] = [];
  let seed = 1;

  for (const person of people) {
    for (const task of STUDY_TASKS) {
      for (const method of ["manual", "system"] as StudyMethod[]) {
        const durationSec = demoDuration(method, seed++);
        const started = new Date(Date.now() - durationSec * 1000 - seed * 60000);
        const completed = new Date(started.getTime() + durationSec * 1000);
        sessions.push({
          id: `demo-${person.id}-t${task.id}-${method}`,
          participantId: person.id,
          participantLabel: person.label,
          method,
          taskId: task.id,
          startedAt: started.toISOString(),
          completedAt: completed.toISOString(),
          durationSec,
          success: true,
          recipesFound: recipeSets[task.id][method],
          notes: method === "manual" ? "Google, YouTube, blog" : "Eatwell+ орц шүүлтүүр",
          isDemo: true,
        });
      }
    }
  }

  return sessions;
}

export function formatDuration(sec: number | null) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
