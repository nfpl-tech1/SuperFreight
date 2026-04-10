"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Copy, RotateCcw } from "lucide-react";
import type { WizardStep } from "@/types/rfq";

interface Props {
    currentStep: WizardStep;
    onBack: () => void;
    onNext: () => void;
    onClear: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    onCopyEmail?: () => void;
}

export function StepNavigation({ currentStep, onBack, onNext, onClear, nextLabel, nextDisabled, onCopyEmail }: Props) {
    return (
        <>
            <div className="sticky bottom-16 z-20 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 xl:hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[hsl(215_20%_48%)]">
                            Step {currentStep} of 4
                        </span>
                        <button
                            type="button"
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                            onClick={onClear}
                        >
                            Clear all
                        </button>
                    </div>

                    {onCopyEmail && (
                        <Button variant="outline" onClick={onCopyEmail} className="mt-3 w-full justify-center">
                            <Copy className="h-4 w-4 mr-1.5" /> Copy Email
                        </Button>
                    )}

                    <div className={cn("mt-3 flex gap-2", currentStep === 1 && "justify-end")}>
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={onBack} className={cn(currentStep < 4 ? "w-24" : "flex-1")}>
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        )}
                        {currentStep < 4 && (
                            <Button onClick={onNext} disabled={nextDisabled} className="flex-1">
                                {nextLabel ?? "Next"} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden items-center justify-between border-t border-border bg-[hsl(214_40%_98%)] px-3 py-2 xl:flex">
                <Button variant="outline" size="sm" onClick={onClear} className="text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear All
                </Button>
                <div className="flex gap-2">
                    {onCopyEmail && (
                        <Button variant="outline" onClick={onCopyEmail}>
                            <Copy className="h-4 w-4 mr-1" /> Copy Email
                        </Button>
                    )}
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={onBack}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                    )}
                    {currentStep < 4 && (
                        <Button onClick={onNext} disabled={nextDisabled}>
                            {nextLabel ?? "Next"} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
