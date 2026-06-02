import {
  analyzeStudySessions,
  createDemoStudySessions,
  type StudySession,
} from "@/lib/study";

describe("study analysis", () => {
  it("demo pilot data shows at least 40% reduction", () => {
    const sessions = createDemoStudySessions();
    const analysis = analyzeStudySessions(sessions);
    expect(analysis.reductionPct).toBeGreaterThanOrEqual(40);
    expect(analysis.participantCount).toBe(5);
  });

  it("does not mark thesis target met when only demo data", () => {
    const analysis = analyzeStudySessions(createDemoStudySessions());
    expect(analysis.meetsTarget).toBe(false);
  });

  it("marks target met with 10+ real sessions and 40%+ reduction", () => {
    const real: StudySession[] = [];
    for (let i = 1; i <= 10; i++) {
      for (const method of ["manual", "system"] as const) {
        real.push({
          id: `${i}-${method}`,
          participantId: `U${i}`,
          participantLabel: `User ${i}`,
          method,
          taskId: 1,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationSec: method === "manual" ? 600 : 300,
          success: true,
          recipesFound: ["A", "B", "C"],
          notes: "",
        });
      }
    }
    const analysis = analyzeStudySessions(real);
    expect(analysis.reductionPct).toBe(50);
    expect(analysis.meetsTarget).toBe(true);
  });
});
