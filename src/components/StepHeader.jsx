const STEP_LABELS = [
  "Research your company",
  "Explore competitors",
  "Define campaigns",
  "Find potential customers",
  "Find decision makers",
  "Write emails",
];

export default function StepHeader({ currentStep }) {
  return (
    <div className="flex items-center gap-3 px-6 py-6 overflow-x-auto">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCurrent = stepNum === currentStep;
        const isDone = stepNum < currentStep;

        return (
          <div key={stepNum} className="flex items-center gap-3 shrink-0">
            {i > 0 && <div className="h-px w-10 bg-border" />}
            {isCurrent ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-sm font-semibold text-text">{stepNum}</span>
                <span className="text-sm font-semibold text-text">{label}</span>
              </div>
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                  isDone
                    ? "border-border text-text-dim"
                    : "border-border text-text-faint"
                }`}
              >
                {stepNum}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
