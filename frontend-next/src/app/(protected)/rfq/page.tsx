"use client";

import { useRef } from "react";
import { useRFQWizard } from "@/components/rfq/hooks/use-rfq-wizard";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { StepProgressBar } from "@/components/rfq/StepProgressBar";
import { StepNavigation } from "@/components/rfq/StepNavigation";
import { QuoteWorkspaceHeader } from "@/components/rfq/QuoteWorkspaceHeader";
import { Step1RFQForm } from "@/components/rfq/steps/Step1RFQForm";
import { Step2ResponseFields } from "@/components/rfq/steps/Step2ResponseFields";
import { Step3VendorSelection } from "@/components/rfq/steps/Step3VendorSelection";
import { Step4ReviewSend } from "@/components/rfq/steps/Step4ReviewSend";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RFQPage() {
  const wizard = useRFQWizard();
  const isMobile = useIsMobile();
  const copyEmailFnRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const compactHeaderTitle =
    wizard.currentStep === 2
      ? "Response Fields"
      : wizard.currentStep === 3
        ? "Vendor Selection"
        : wizard.currentStep === 4
          ? "Review & Send"
          : undefined;
  const compactHeaderSubtitle = wizard.currentInquiry
    ? `${wizard.currentInquiry.inquiryNumber} - ${wizard.currentInquiry.cargoSummary ?? wizard.currentInquiry.customerName}`
    : undefined;

  const handleNext = () => {
    const error = wizard.goNext();
    if (error) toast.error(error);
  };

  const handleSaveQuote = async () => {
    try {
      await wizard.saveDraftRfq();
      toast.success("Quote saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save quote.");
    }
  };

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <Step1RFQForm
            inquiryId={wizard.inquiryId}
            inquiryNumber={wizard.currentInquiry?.inquiryNumber ?? wizard.inquiryId}
            department={wizard.department}
            formValues={wizard.formValues}
            validation={wizard.validation}
            inquiries={wizard.availableInquiries}
            tradeLane={wizard.currentInquiry?.tradeLane ?? undefined}
            incoterm={wizard.currentInquiry?.incoterm ?? undefined}
            onFieldChange={wizard.handleFieldChange}
            onCopyReady={(fn) => {
              copyEmailFnRef.current = fn;
            }}
          />
        );
      case 2:
        return (
          <Step2ResponseFields
            responseFields={wizard.responseFields}
            onToggle={wizard.toggleResponseField}
            onAddCustom={wizard.addCustomField}
            onRemoveCustom={wizard.removeCustomField}
          />
        );
      case 3:
        return (
          <Step3VendorSelection
            filterCriteria={wizard.filterCriteria}
            vendorLookups={wizard.vendorLookups}
            selectionProfile={wizard.vendorSelectionProfile}
            onFilterChange={wizard.setFilterCriteria}
            locationOptions={wizard.locationOptions}
            loadingLocationOptions={wizard.isLoadingLocationOptions}
            onWidenScopeToCountry={wizard.widenVendorScopeToCountry}
            onResetScopeToExact={wizard.resetVendorScopeToExact}
            fetchedVendors={wizard.fetchedVendors}
            vendorPage={wizard.vendorPage}
            vendorTotal={wizard.vendorTotal}
            vendorTotalPages={wizard.vendorTotalPages}
            loadingVendors={wizard.isLoadingVendors}
            selectedVendors={wizard.selectedVendors}
            selectedVendorIds={wizard.selectedVendorIds}
            onToggleVendor={wizard.toggleVendor}
            onClearSelectedVendors={wizard.clearSelectedVendors}
            onPreviousPage={wizard.goToPreviousVendorPage}
            onNextPage={wizard.goToNextVendorPage}
          />
        );
      case 4:
        return (
          <Step4ReviewSend
            department={wizard.department}
            formValues={wizard.formValues}
            selectedResponseFields={wizard.selectedResponseFields}
            selectedVendors={wizard.selectedVendors}
            selectedVendorDispatchTargets={wizard.selectedVendorDispatchTargets}
            inquiryId={wizard.inquiryId}
            inquiryNumber={wizard.currentInquiry?.inquiryNumber ?? wizard.inquiryId}
            inquiryCustomer={
              wizard.availableInquiries.find(
                (inquiry) => inquiry.id === wizard.inquiryId,
              )?.customerName ?? ""
            }
            tradeLane={wizard.currentInquiry?.tradeLane ?? undefined}
            incoterm={wizard.currentInquiry?.incoterm ?? undefined}
            isSending={wizard.isSubmitting}
            outlookStatus={wizard.outlookStatus}
            onOfficeChange={wizard.setSelectedVendorOffice}
            onSend={wizard.saveRfq}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-[hsl(214_40%_98%)]",
        isMobile
          ? "-mx-4 -mt-4 min-h-full bg-[hsl(214_40%_98%)]"
          : "-m-8 h-[calc(100vh-3.5rem-1px)] overflow-hidden",
      )}
    >
      <div className="sticky top-0 z-30 shrink-0 border-b border-[hsl(214_32%_88%)] bg-white/94 backdrop-blur supports-[backdrop-filter]:bg-white/84">
        <StepProgressBar
          currentStep={wizard.currentStep}
          completedSteps={wizard.completedSteps}
          onStepClick={wizard.goToStep}
        />
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          isMobile ? "overflow-visible px-4 py-4 pb-28" : "overflow-y-auto px-4 pt-4 pb-3",
        )}
      >
        <div className={cn("flex flex-col gap-4", isMobile ? "h-auto" : "min-h-full")}>
          <QuoteWorkspaceHeader
            inquiryId={wizard.inquiryId}
            inquiries={wizard.availableInquiries}
            currentInquiry={wizard.currentInquiry}
            quotePlanSummary={wizard.quotePlanSummary}
            quoteOptions={wizard.recommendedQuoteTypes}
            departmentId={wizard.departmentId}
            onInquiryChange={wizard.handleInquiryChange}
            onDepartmentChange={wizard.handleDepartmentChange}
            onSaveQuote={handleSaveQuote}
            isSavingQuote={wizard.isSavingDraft}
            compact={wizard.currentStep > 1}
            compactTitle={wizard.currentStep > 1 ? compactHeaderTitle : undefined}
            compactSubtitle={
              wizard.currentStep > 1 ? compactHeaderSubtitle : undefined
            }
          />
          {renderStep()}
        </div>
      </div>
      <StepNavigation
        currentStep={wizard.currentStep}
        onBack={wizard.goBack}
        onNext={handleNext}
        onClear={wizard.clearAll}
        onCopyEmail={
          wizard.currentStep === 1
            ? () => copyEmailFnRef.current?.()
            : undefined
        }
        nextDisabled={wizard.currentStep === 4 ? wizard.isSubmitting : false}
      />
    </div>
  );
}
