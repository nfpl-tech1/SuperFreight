import { departments } from "@/data/departments";
import { getDefaultResponseFields } from "@/data/responseFields";
import {
  getRecommendedDepartmentIdForInquiry,
} from "@/lib/inquiryQuotePlanning";
import type {
  DepartmentDefinition,
  FormValues,
  ResponseField,
  VendorFilterCriteria,
  WizardStep,
} from "@/types/rfq";
import { defaultFilterCriteria, normalizeVendorFilterCriteria } from "@/lib/vendorFilter";
import { Inquiry } from "@/lib/api";

const STORAGE_KEY = "rfq_wizard_draft";

type SerializedQuoteDraft = {
  formValues?: FormValues;
  responseFields?: ResponseField[];
  filterCriteria?: VendorFilterCriteria;
  selectedVendorIds?: string[];
  selectedVendorOfficeIds?: Record<string, string | string[]>;
  completedSteps?: WizardStep[];
};

type WizardDraftPayload = {
  currentStep?: WizardStep;
  inquiryId?: string;
  departmentId?: string;
  quoteDrafts?: Record<string, SerializedQuoteDraft>;
  formValues?: FormValues;
  responseFields?: ResponseField[];
  filterCriteria?: VendorFilterCriteria;
  selectedVendorIds?: string[];
  completedSteps?: WizardStep[];
};

export type QuoteDraftState = {
  formValues: FormValues;
  responseFields: ResponseField[];
  filterCriteria: VendorFilterCriteria;
  selectedVendorIds: Set<string>;
  selectedVendorOfficeIds: Record<string, string[]>;
  completedSteps: Set<WizardStep>;
};

export type WizardState = {
  currentStep: WizardStep;
  inquiryId: string;
  departmentId: string;
  quoteDrafts: Record<string, QuoteDraftState>;
};

export function buildDefaults(department: DepartmentDefinition): FormValues {
  const values: FormValues = {};

  for (const field of department.fields) {
    if (field.default !== undefined && field.default !== "") {
      values[field.key] = field.default;
    } else if (field.type === "multiselect") {
      values[field.key] = [];
    } else if (field.type === "select" && field.options?.length) {
      values[field.key] = field.options[0];
    } else {
      values[field.key] = "";
    }
  }

  return values;
}

export function createQuoteDraftState(
  department: DepartmentDefinition,
  inquiry?: Inquiry,
): QuoteDraftState {
  return {
    formValues: applyInquiryDefaults(department, inquiry, {}, true),
    responseFields: getDefaultResponseFields(department.id),
    filterCriteria: defaultFilterCriteria(),
    selectedVendorIds: new Set<string>(),
    selectedVendorOfficeIds: {},
    completedSteps: new Set<WizardStep>(),
  };
}

export function updateQuoteDraftFormValue(
  draft: QuoteDraftState,
  key: string,
  value: string | string[],
): QuoteDraftState {
  return {
    ...draft,
    formValues: { ...draft.formValues, [key]: value },
  };
}

export function toggleQuoteDraftResponseField(
  draft: QuoteDraftState,
  id: string,
): QuoteDraftState {
  return {
    ...draft,
    responseFields: draft.responseFields.map((field) =>
      field.id === id ? { ...field, selected: !field.selected } : field,
    ),
  };
}

export function addQuoteDraftCustomField(
  draft: QuoteDraftState,
  id: string,
  label: string,
): QuoteDraftState {
  return {
    ...draft,
    responseFields: [...draft.responseFields, { id, label, isCustom: true, selected: true }],
  };
}

export function removeQuoteDraftResponseField(
  draft: QuoteDraftState,
  id: string,
): QuoteDraftState {
  return {
    ...draft,
    responseFields: draft.responseFields.filter((field) => field.id !== id),
  };
}

export function replaceQuoteDraftFilterCriteria(
  draft: QuoteDraftState,
  filterCriteria: VendorFilterCriteria,
): QuoteDraftState {
  return {
    ...draft,
    filterCriteria,
  };
}

export function toggleQuoteDraftVendorSelection(
  draft: QuoteDraftState,
  vendorId: string,
): QuoteDraftState {
  const nextSelectedVendorIds = new Set(draft.selectedVendorIds);
  const nextSelectedVendorOfficeIds = { ...draft.selectedVendorOfficeIds };

  if (nextSelectedVendorIds.has(vendorId)) {
    nextSelectedVendorIds.delete(vendorId);
    delete nextSelectedVendorOfficeIds[vendorId];
  } else {
    nextSelectedVendorIds.add(vendorId);
  }

  return {
    ...draft,
    selectedVendorIds: nextSelectedVendorIds,
    selectedVendorOfficeIds: nextSelectedVendorOfficeIds,
  };
}

export function selectQuoteDraftVendors(
  draft: QuoteDraftState,
  vendorIds: Iterable<string>,
): QuoteDraftState {
  return {
    ...draft,
    selectedVendorIds: new Set([
      ...draft.selectedVendorIds,
      ...vendorIds,
    ]),
  };
}

export function deselectQuoteDraftVendors(
  draft: QuoteDraftState,
  vendorIds: Iterable<string>,
): QuoteDraftState {
  const vendorIdSet = new Set(vendorIds);

  return {
    ...draft,
    selectedVendorIds: new Set(
      Array.from(draft.selectedVendorIds).filter((vendorId) => !vendorIdSet.has(vendorId)),
    ),
  };
}

export function clearQuoteDraftVendors(draft: QuoteDraftState): QuoteDraftState {
  return {
    ...draft,
    selectedVendorIds: new Set<string>(),
    selectedVendorOfficeIds: {},
  };
}

export function setQuoteDraftVendorOfficeSelection(
  draft: QuoteDraftState,
  vendorId: string,
  officeId: string,
  checked: boolean,
): QuoteDraftState {
  const selectedOfficeIds = draft.selectedVendorOfficeIds[vendorId] ?? [];

  return {
    ...draft,
    selectedVendorOfficeIds: {
      ...draft.selectedVendorOfficeIds,
      [vendorId]: checked
        ? Array.from(new Set([...selectedOfficeIds, officeId]))
        : selectedOfficeIds.filter((selectedOfficeId) => selectedOfficeId !== officeId),
    },
  };
}

export function setQuoteDraftLocationScope(
  draft: QuoteDraftState,
  locationScope: VendorFilterCriteria["locationScope"],
): QuoteDraftState {
  return {
    ...draft,
    filterCriteria: {
      ...draft.filterCriteria,
      locationScope,
    },
  };
}

export function applySuggestedLocationSearch(
  draft: QuoteDraftState,
  locationFocus: VendorFilterCriteria["locationFocus"],
  locationQuery: string,
): QuoteDraftState {
  return {
    ...draft,
    filterCriteria: {
      ...draft.filterCriteria,
      locationFocus,
      locationQuery,
    },
  };
}

export function markQuoteDraftStepCompleted(
  draft: QuoteDraftState,
  step: WizardStep,
): QuoteDraftState {
  return {
    ...draft,
    completedSteps: new Set([...draft.completedSteps, step]),
  };
}

export function markQuoteDraftStepsCompleted(
  draft: QuoteDraftState,
  steps: Iterable<WizardStep>,
): QuoteDraftState {
  return {
    ...draft,
    completedSteps: new Set<WizardStep>(steps),
  };
}

function serializeQuoteDraft(quoteDraft: QuoteDraftState): SerializedQuoteDraft {
  return {
    formValues: quoteDraft.formValues,
    responseFields: quoteDraft.responseFields,
    filterCriteria: quoteDraft.filterCriteria,
    selectedVendorIds: Array.from(quoteDraft.selectedVendorIds),
    selectedVendorOfficeIds: quoteDraft.selectedVendorOfficeIds,
    completedSteps: Array.from(quoteDraft.completedSteps),
  };
}

function deserializeQuoteDraft(
  quoteDraft: SerializedQuoteDraft | undefined,
  department: DepartmentDefinition,
): QuoteDraftState {
  const fallback = createQuoteDraftState(department);

  if (!quoteDraft) {
    return fallback;
  }

  const selectedVendorOfficeIds = Object.fromEntries(
    Object.entries(quoteDraft.selectedVendorOfficeIds ?? {}).map(
      ([vendorId, officeIds]) => [
        vendorId,
        Array.isArray(officeIds)
          ? officeIds.filter((officeId): officeId is string => Boolean(officeId))
          : officeIds
            ? [officeIds]
            : [],
      ],
    ),
  );

  return {
    formValues: quoteDraft.formValues ?? fallback.formValues,
    responseFields: quoteDraft.responseFields ?? fallback.responseFields,
    filterCriteria: normalizeVendorFilterCriteria({
      ...fallback.filterCriteria,
      ...(quoteDraft.filterCriteria ?? {}),
    }),
    selectedVendorIds: new Set<string>(quoteDraft.selectedVendorIds ?? []),
    selectedVendorOfficeIds,
    completedSteps: new Set<WizardStep>(quoteDraft.completedSteps ?? []),
  };
}

export function createInitialWizardState(): WizardState {
  const defaultDepartment = departments[0];

  return {
    currentStep: 1,
    inquiryId: "",
    departmentId: defaultDepartment.id,
    quoteDrafts: {
      [defaultDepartment.id]: createQuoteDraftState(defaultDepartment),
    },
  };
}

export function loadWizardState(): WizardState {
  const fallback = createInitialWizardState();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved) as WizardDraftPayload;

    if (parsed.quoteDrafts) {
      const nextQuoteDrafts = Object.entries(parsed.quoteDrafts).reduce<Record<string, QuoteDraftState>>(
        (accumulator, [departmentId, quoteDraft]) => {
          const department = departments.find((item) => item.id === departmentId);
          if (!department) {
            return accumulator;
          }

          accumulator[departmentId] = deserializeQuoteDraft(quoteDraft, department);
          return accumulator;
        },
        {},
      );

      if (Object.keys(nextQuoteDrafts).length === 0) {
        return fallback;
      }

      return {
        currentStep: parsed.currentStep || fallback.currentStep,
        inquiryId: parsed.inquiryId || fallback.inquiryId,
        departmentId: parsed.departmentId || Object.keys(nextQuoteDrafts)[0] || fallback.departmentId,
        quoteDrafts: nextQuoteDrafts,
      };
    }

    const departmentId = parsed.departmentId || fallback.departmentId;
    const department = departments.find((item) => item.id === departmentId) ?? departments[0];

    return {
      currentStep: parsed.currentStep || fallback.currentStep,
      inquiryId: parsed.inquiryId || fallback.inquiryId,
      departmentId,
      quoteDrafts: {
        [departmentId]: deserializeQuoteDraft(
          {
            formValues: parsed.formValues,
            responseFields: parsed.responseFields,
            filterCriteria: parsed.filterCriteria,
            selectedVendorIds: parsed.selectedVendorIds,
            completedSteps: parsed.completedSteps,
          },
          department,
        ),
      },
    };
  } catch {
    return fallback;
  }
}

export function persistWizardState(state: WizardState) {
  const payload = {
    currentStep: state.currentStep,
    inquiryId: state.inquiryId,
    departmentId: state.departmentId,
    quoteDrafts: Object.fromEntries(
      Object.entries(state.quoteDrafts).map(([departmentId, quoteDraft]) => [
        departmentId,
        serializeQuoteDraft(quoteDraft),
      ]),
    ),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedWizardState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDepartmentForInquiry(
  inquiryId: string,
  availableInquiries: Inquiry[],
  currentDepartmentId: string
) {
  const inquiry = availableInquiries.find((item) => item.id === inquiryId);
  if (!inquiry) {
    return null;
  }

  const nextDepartmentId = getRecommendedDepartmentIdForInquiry(
    inquiry,
    currentDepartmentId,
  );
  const nextDepartment = departments.find((item) => item.id === nextDepartmentId) ?? departments[0];

  return {
    inquiry,
    nextDepartment,
    changed: nextDepartment.id !== currentDepartmentId,
  };
}

export function normalizeInquiryModeForDepartment(
  shipmentMode: string | null | undefined,
  department: DepartmentDefinition,
) {
  if (!shipmentMode) {
    return null;
  }

  const modeField = department.fields.find((field) => field.key === "mode");
  if (!modeField?.options?.length) {
    return null;
  }

  const optionLookup = new Map(
    modeField.options.map((option) => [option.toUpperCase(), option]),
  );
  const normalizedMode = shipmentMode.trim().toUpperCase();

  if (optionLookup.has(normalizedMode)) {
    return optionLookup.get(normalizedMode) ?? null;
  }

  return null;
}

export function applyInquiryDefaults(
  department: DepartmentDefinition,
  inquiry: Inquiry | undefined,
  previousValues: FormValues,
  resetToDepartmentDefaults = false,
): FormValues {
  const baseValues = resetToDepartmentDefaults
    ? buildDefaults(department)
    : { ...previousValues };

  if (!inquiry) {
    return baseValues;
  }

  const normalizedMode = normalizeInquiryModeForDepartment(
    inquiry.shipmentMode,
    department,
  );

  const fieldKeys = new Set(department.fields.map((field) => field.key));
  const nextValues = {
    ...baseValues,
  };

  if (fieldKeys.has("source")) {
    nextValues.source = inquiry.origin ?? baseValues.source ?? "";
  }

  if (fieldKeys.has("destination")) {
    nextValues.destination = inquiry.destination ?? baseValues.destination ?? "";
  }

  if (fieldKeys.has("trade_lane")) {
    nextValues.trade_lane = inquiry.tradeLane ?? baseValues.trade_lane ?? "";
  }

  if (fieldKeys.has("mode")) {
    nextValues.mode = normalizedMode ?? baseValues.mode ?? "";
  }

  if (fieldKeys.has("incoterm")) {
    nextValues.incoterm = inquiry.incoterm ?? baseValues.incoterm ?? "";
  }

  if (fieldKeys.has("cargo_summary")) {
    nextValues.cargo_summary = inquiry.cargoSummary ?? baseValues.cargo_summary ?? "";
  }

  if (fieldKeys.has("commodity_description")) {
    nextValues.commodity_description =
      inquiry.cargoSummary ?? baseValues.commodity_description ?? "";
  }

  return nextValues;
}
