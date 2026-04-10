"use client";

import type { WizardStep } from "@/types/rfq";
import { cn } from "@/lib/utils";
import { FileText, ListChecks, Users, Send } from "lucide-react";

interface Props {
    currentStep: WizardStep;
    completedSteps: Set<WizardStep>;
    onStepClick: (step: WizardStep) => void;
}

const STEPS: { step: WizardStep; label: string; icon: typeof FileText }[] = [
    { step: 1, label: "RFQ Form", icon: FileText },
    { step: 2, label: "Response Fields", icon: ListChecks },
    { step: 3, label: "Vendor Selection", icon: Users },
    { step: 4, label: "Review & Send", icon: Send },
];

export function StepProgressBar({ currentStep, completedSteps, onStepClick }: Props) {
    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="border-b border-border bg-[hsl(214_40%_98%)]">
            <div className="xl:hidden">
                <div className="px-4 pt-3">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-[hsl(215_20%_48%)]">
                                RFQ Wizard
                            </p>
                            <h2 className="mt-1 text-sm font-semibold text-primary">
                                Step {currentStep} of {STEPS.length}
                            </h2>
                        </div>
                        <span className="rounded-full border border-border bg-white px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground shadow-sm">
                            {completedSteps.size} completed
                        </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(214_32%_90%)]">
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {STEPS.map(({ step, label, icon: Icon }) => {
                        const isActive = step === currentStep;
                        const isCompleted = completedSteps.has(step);
                        const isClickable = isCompleted || step <= currentStep;

                        return (
                            <button
                                key={step}
                                type="button"
                                className={cn(
                                    "min-w-[5.75rem] rounded-2xl border px-3 py-2.5 text-left transition-all",
                                    isActive
                                        ? "border-primary bg-primary text-white shadow-sm"
                                        : isCompleted
                                            ? "border-[hsl(142_42%_78%)] bg-[hsl(142_45%_95%)] text-[hsl(142_62%_24%)]"
                                            : "border-border bg-white text-[hsl(215_20%_44%)]",
                                    !isClickable && "opacity-50",
                                )}
                                onClick={() => isClickable && onStepClick(step)}
                                disabled={!isClickable}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full",
                                            isActive
                                                ? "bg-white/18 text-white"
                                                : isCompleted
                                                    ? "bg-white text-[hsl(142_62%_28%)]"
                                                    : "bg-[hsl(214_32%_93%)] text-primary",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em]">
                                        0{step}
                                    </span>
                                </div>
                                <p className={cn("mt-2 text-[0.72rem] font-medium leading-tight", isActive ? "text-white" : "text-inherit")}>
                                    {label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="hidden items-center justify-center py-1 xl:flex">
                {STEPS.map(({ step, label, icon: Icon }, idx) => {
                    const isActive = step === currentStep;
                    const isCompleted = completedSteps.has(step);
                    const isClickable = isCompleted || step <= currentStep;

                    return (
                        <div key={step} className="flex items-center">
                            {idx > 0 && (
                                <div className={`w-12 h-0.5 transition-colors ${isCompleted || isActive ? "bg-primary" : "bg-[hsl(214_32%_85%)]"}`} />
                            )}
                            <button
                                type="button"
                                className={`flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 transition-opacity ${
                                    isActive ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-40"
                                } disabled:cursor-not-allowed`}
                                onClick={() => isClickable && onStepClick(step)}
                                disabled={!isClickable}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                    isActive ? "bg-primary text-white"
                                    : isCompleted ? "bg-[hsl(142_60%_40%)] text-white"
                                    : "bg-[hsl(214_32%_91%)]"
                                }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-[0.6875rem] font-medium whitespace-nowrap ${
                                    isActive ? "text-primary font-semibold" : "text-[hsl(215_20%_40%)]"
                                }`}>{label}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
