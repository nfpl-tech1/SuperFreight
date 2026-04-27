"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useDeferredValue,
  useRef,
} from "react";
import { ApiError } from "@/lib/api";
import type {
  FilterableVendor,
  VendorDispatchTarget,
  VendorLocationOption,
  ValidationResult,
  VendorFilterCriteria,
  VendorLookupBundle,
  WizardStep,
} from "@/types/rfq";
import { validateAllFields } from "@/lib/validation";
import {
  api,
  Inquiry,
  OutlookStatus,
  Rfq,
  VendorCatalogPage,
  VendorDetail,
  VendorListQuery,
} from "@/lib/api";
import { planQuoteTypesForInquiry } from "@/lib/inquiryQuotePlanning";
import { toast } from "sonner";
import type { RfqPreviewDraft } from "@/components/rfq/RFQPreview";
import {
  addQuoteDraftCustomField,
  applySuggestedLocationSearch,
  clearQuoteDraftVendors,
  clearPersistedWizardState,
  createInitialWizardState,
  createQuoteDraftState,
  deselectQuoteDraftVendors,
  getDepartmentForInquiry,
  loadWizardState,
  markQuoteDraftStepCompleted,
  markQuoteDraftStepsCompleted,
  persistWizardState,
  QuoteDraftState,
  removeQuoteDraftResponseField,
  replaceQuoteDraftFilterCriteria,
  selectQuoteDraftVendors,
  setQuoteDraftLocationScope,
  setQuoteDraftVendorOfficeSelection,
  toggleQuoteDraftResponseField,
  toggleQuoteDraftVendorSelection,
  updateQuoteDraftCustomCcEmail,
  updateQuoteDraftFormValue,
} from "@/components/rfq/lib/rfq-wizard.helpers";
import {
  buildLoadingVendorDispatchTarget,
  buildRfqOfficeSelections,
  buildVendorLocationOptionsQuery,
  buildVendorDispatchTarget,
  buildInitialQuoteDraftsForInquiry,
  buildVendorListQuery,
  buildVendorLookups,
  countRfqsByDepartment,
  createQuoteDraftFromRfq,
  getDepartment,
  getNextRecommendedDepartmentIdAfterSend,
  getSuggestedLocationSearch,
  getLatestInquiryRfqsByDepartment,
  getUnresolvedDispatchTargets,
  getWizardStepError,
  isQuoteReady,
  mapVendorDetailToFilterableVendor,
  mapVendorListItemToFilterableVendor,
  mapRecommendedQuoteTypes,
  mergeVendorDirectoryEntries,
  resolveQuoteDraft,
  shouldLoadVendorResults,
  usesLocationLookupMode,
} from "@/components/rfq/hooks/use-rfq-wizard.helpers";
import { getVendorSelectionProfile } from "@/components/rfq/vendor-selection-profile";

const RFQ_VENDOR_PAGE_SIZE = 25;

export function useRFQWizard() {
  const [availableInquiries, setAvailableInquiries] = useState<Inquiry[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [vendorSource, setVendorSource] = useState<FilterableVendor[]>([]);
  const [vendorDirectory, setVendorDirectory] = useState<
    Record<string, FilterableVendor>
  >({});
  const [vendorDetailsById, setVendorDetailsById] = useState<
    Record<string, VendorDetail>
  >({});
  const [vendorLookups, setVendorLookups] = useState<VendorLookupBundle>(
    buildVendorLookups([]),
  );
  const [vendorCategoryNames, setVendorCategoryNames] = useState<string[]>([]);
  const [vendorTypeCodeByName, setVendorTypeCodeByName] = useState<
    Record<string, string>
  >({});
  const [locationOptions, setLocationOptions] = useState<
    VendorLocationOption[]
  >([]);
  const [isLoadingLocationOptions, setIsLoadingLocationOptions] =
    useState(false);
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorTotal, setVendorTotal] = useState(0);
  const [vendorTotalPages, setVendorTotalPages] = useState(0);
  const [isVendorCatalogReady, setIsVendorCatalogReady] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [outlookStatus, setOutlookStatus] = useState<OutlookStatus | null>(
    null,
  );
  const vendorCatalogCacheRef = useRef<Map<string, VendorCatalogPage>>(
    new Map(),
  );
  const vendorCatalogRequestRef = useRef<
    Map<string, Promise<VendorCatalogPage>>
  >(new Map());
  const locationSuggestionAppliedRef = useRef<string | null>(null);

  const initialState = useMemo(() => loadWizardState(), []);
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    initialState.currentStep as WizardStep,
  );
  const [inquiryId, setInquiryId] = useState(initialState.inquiryId);
  const [departmentId, setDepartmentId] = useState(initialState.departmentId);
  const [quoteDrafts, setQuoteDrafts] = useState<
    Record<string, QuoteDraftState>
  >(initialState.quoteDrafts);

  useEffect(() => {
    persistWizardState({
      currentStep,
      inquiryId,
      departmentId,
      quoteDrafts,
    });
  }, [currentStep, inquiryId, departmentId, quoteDrafts]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.getInquiries(),
      api.getRfqs(),
      api.getVendorLookups(),
      api.getOutlookStatus(),
    ])
      .then(
        ([
          inquiriesResult,
          rfqsResult,
          vendorLookupsResult,
          outlookStatusResult,
        ]) => {
          if (cancelled) {
            return;
          }

          setAvailableInquiries(
            inquiriesResult.status === "fulfilled" ? inquiriesResult.value : [],
          );
          setRfqs(rfqsResult.status === "fulfilled" ? rfqsResult.value : []);
          setOutlookStatus(
            outlookStatusResult.status === "fulfilled"
              ? outlookStatusResult.value
              : null,
          );

          if (vendorLookupsResult.status === "fulfilled") {
            const categoryNames = vendorLookupsResult.value.vendorTypes.map(
              (vendorType) => vendorType.typeName,
            );
            setVendorCategoryNames(categoryNames);
            setVendorTypeCodeByName(
              Object.fromEntries(
                vendorLookupsResult.value.vendorTypes.map((vendorType) => [
                  vendorType.typeName,
                  vendorType.typeCode,
                ]),
              ),
            );
            setVendorLookups(buildVendorLookups([], categoryNames));
          } else {
            setVendorLookups(buildVendorLookups([]));
            setVendorCategoryNames([]);
            setVendorTypeCodeByName({});
            toast.error("Failed to load vendor filter lookups.");
          }

          setIsVendorCatalogReady(true);
        },
      )
      .catch(() => {
        if (!cancelled) {
          setAvailableInquiries([]);
          setRfqs([]);
          setVendorSource([]);
          setVendorDirectory({});
          setVendorLookups(buildVendorLookups([]));
          setVendorCategoryNames([]);
          setVendorTypeCodeByName({});
          setVendorTotal(0);
          setVendorTotalPages(0);
          setIsVendorCatalogReady(true);
          toast.error("Failed to load RFQ setup data.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentInquiry = useMemo(
    () => availableInquiries.find((item) => item.id === inquiryId),
    [availableInquiries, inquiryId],
  );

  const department = useMemo(() => getDepartment(departmentId), [departmentId]);

  const quotePlan = useMemo(
    () => planQuoteTypesForInquiry(currentInquiry),
    [currentInquiry],
  );

  const inquiryRfqs = useMemo(
    () => rfqs.filter((rfq) => rfq.inquiryId === inquiryId),
    [rfqs, inquiryId],
  );

  const latestInquiryRfqsByDepartment = useMemo(
    () => getLatestInquiryRfqsByDepartment(inquiryRfqs),
    [inquiryRfqs],
  );

  const draftedRfqCounts = useMemo(
    () => countRfqsByDepartment(inquiryRfqs),
    [inquiryRfqs],
  );

  const recommendedQuoteTypes = useMemo(
    () => mapRecommendedQuoteTypes(quotePlan.recommendations, draftedRfqCounts),
    [draftedRfqCounts, quotePlan.recommendations],
  );

  useEffect(() => {
    if (!currentInquiry && !departmentId) {
      return;
    }

    const departmentIds = Array.from(
      new Set([
        departmentId,
        ...recommendedQuoteTypes.map(
          (recommendation) => recommendation.departmentId,
        ),
      ]),
    ).filter(Boolean);

    if (departmentIds.length === 0) {
      return;
    }

    setQuoteDrafts((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const id of departmentIds) {
        if (next[id]) {
          continue;
        }

        const latestRfq = latestInquiryRfqsByDepartment[id];
        next[id] = latestRfq
          ? createQuoteDraftFromRfq(id, currentInquiry, latestRfq)
          : createQuoteDraftState(getDepartment(id), currentInquiry);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    currentInquiry,
    departmentId,
    latestInquiryRfqsByDepartment,
    recommendedQuoteTypes,
  ]);

  const currentQuoteDraft = useMemo(
    () =>
      resolveQuoteDraft(
        departmentId,
        quoteDrafts,
        latestInquiryRfqsByDepartment,
        currentInquiry,
      ),
    [currentInquiry, departmentId, latestInquiryRfqsByDepartment, quoteDrafts],
  );

  const formValues = currentQuoteDraft.formValues;
  const responseFields = currentQuoteDraft.responseFields;
  const filterCriteria = currentQuoteDraft.filterCriteria;
  const customCcEmail = currentQuoteDraft.customCcEmail;
  const deferredLocationQuery = useDeferredValue(filterCriteria.locationQuery);
  const selectedVendorIds = currentQuoteDraft.selectedVendorIds;
  const selectedVendorOfficeIds = currentQuoteDraft.selectedVendorOfficeIds;
  const completedSteps = currentQuoteDraft.completedSteps;

  const currentQuoteIsReady = useMemo(() => {
    return isQuoteReady(draftedRfqCounts[departmentId]);
  }, [departmentId, draftedRfqCounts]);

  const vendorSelectionProfile = useMemo(
    () =>
      getVendorSelectionProfile({
        departmentId,
        inquiry: currentInquiry,
        formValues,
        availableCategories: vendorCategoryNames,
      }),
    [currentInquiry, departmentId, formValues, vendorCategoryNames],
  );

  const validation: ValidationResult = useMemo(
    () => validateAllFields(department.fields, formValues),
    [department.fields, formValues],
  );

  const suggestedLocationSearch = useMemo(
    () =>
      getSuggestedLocationSearch(
        vendorSelectionProfile,
        formValues,
        currentInquiry,
      ),
    [currentInquiry, formValues, vendorSelectionProfile],
  );

  const locationOptionsQuery = useMemo(
    () =>
      buildVendorLocationOptionsQuery(
        {
          ...filterCriteria,
          locationQuery: deferredLocationQuery,
        },
        vendorTypeCodeByName,
        vendorSelectionProfile,
      ),
    [
      deferredLocationQuery,
      filterCriteria,
      vendorSelectionProfile,
      vendorTypeCodeByName,
    ],
  );

  const vendorQuery = useMemo(
    () =>
      buildVendorListQuery(
        {
          ...filterCriteria,
          locationQuery: deferredLocationQuery,
        },
        vendorTypeCodeByName,
        vendorPage,
        RFQ_VENDOR_PAGE_SIZE,
        vendorSelectionProfile,
      ),
    [
      deferredLocationQuery,
      filterCriteria,
      vendorPage,
      vendorSelectionProfile,
      vendorTypeCodeByName,
    ],
  );

  const locationOptionsQueryKey = useMemo(
    () => JSON.stringify(locationOptionsQuery),
    [locationOptionsQuery],
  );
  const vendorQueryKey = useMemo(
    () => JSON.stringify(vendorQuery),
    [vendorQuery],
  );

  useEffect(() => {
    if (!isVendorCatalogReady || currentStep !== 3) {
      return;
    }

    if (!usesLocationLookupMode(filterCriteria)) {
      setLocationOptions([]);
      setIsLoadingLocationOptions(false);
      return;
    }

    let cancelled = false;
    setIsLoadingLocationOptions(true);

    api
      .getVendorLocationOptions(locationOptionsQuery)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setLocationOptions(
          response.items.map((item) => ({
            id: item.id,
            kind: item.kind,
            label: item.label,
            subLabel: item.subLabel,
            countryName: item.countryName,
            portMode: item.portMode,
            recommended: item.recommended,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setLocationOptions([]);
          toast.error("Failed to load location options.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLocationOptions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentStep,
    filterCriteria,
    isVendorCatalogReady,
    locationOptionsQuery,
    locationOptionsQueryKey,
  ]);

  const applyVendorCatalogPage = useCallback(
    (response: VendorCatalogPage) => {
      const mappedVendors = response.items.map(
        mapVendorListItemToFilterableVendor,
      );
      setVendorSource(mappedVendors);
      setVendorDirectory((currentDirectory) =>
        mergeVendorDirectoryEntries(currentDirectory, mappedVendors),
      );
      setVendorTotal(response.total);
      setVendorTotalPages(response.totalPages);
      setVendorLookups(buildVendorLookups(mappedVendors, vendorCategoryNames));
    },
    [vendorCategoryNames],
  );

  const requestVendorCatalogPage = useCallback(
    (query: VendorListQuery, queryKey: string) => {
      const cachedPage = vendorCatalogCacheRef.current.get(queryKey);
      if (cachedPage) {
        return Promise.resolve(cachedPage);
      }

      const pendingRequest = vendorCatalogRequestRef.current.get(queryKey);
      if (pendingRequest) {
        return pendingRequest;
      }

      const requestPromise = api
        .getVendors(query)
        .then((response) => {
          vendorCatalogCacheRef.current.set(queryKey, response);
          return response;
        })
        .finally(() => {
          vendorCatalogRequestRef.current.delete(queryKey);
        });

      vendorCatalogRequestRef.current.set(queryKey, requestPromise);
      return requestPromise;
    },
    [],
  );

  useEffect(() => {
    if (!isVendorCatalogReady || currentStep !== 3) {
      return;
    }

    if (!shouldLoadVendorResults(filterCriteria)) {
      setVendorSource([]);
      setVendorTotal(0);
      setVendorTotalPages(0);
      setIsLoadingVendors(false);
      return;
    }

    let cancelled = false;
    const cachedPage = vendorCatalogCacheRef.current.get(vendorQueryKey);

    if (cachedPage) {
      applyVendorCatalogPage(cachedPage);
      setIsLoadingVendors(false);
      return;
    }

    setIsLoadingVendors(true);

    requestVendorCatalogPage(vendorQuery, vendorQueryKey)
      .then((response) => {
        if (cancelled) {
          return;
        }

        applyVendorCatalogPage(response);

        const nextPage = response.page + 1;
        if (nextPage <= response.totalPages) {
          const nextQuery = {
            ...vendorQuery,
            page: nextPage,
          };
          const nextQueryKey = JSON.stringify(nextQuery);

          void requestVendorCatalogPage(nextQuery, nextQueryKey).catch(
            () => undefined,
          );
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setVendorSource([]);
        setVendorTotal(0);
        setVendorTotalPages(0);
        toast.error("Failed to load vendors from vendor master.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingVendors(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    applyVendorCatalogPage,
    currentStep,
    filterCriteria,
    isVendorCatalogReady,
    requestVendorCatalogPage,
    vendorQuery,
    vendorQueryKey,
  ]);

  const missingSelectedVendorDetailIds = useMemo(
    () =>
      Array.from(selectedVendorIds).filter(
        (vendorId) => !vendorDetailsById[vendorId],
      ),
    [selectedVendorIds, vendorDetailsById],
  );

  useEffect(() => {
    if (missingSelectedVendorDetailIds.length === 0) {
      return;
    }

    let cancelled = false;

    Promise.allSettled(
      missingSelectedVendorDetailIds.map((vendorId) =>
        api.getVendorDetail(vendorId),
      ),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const details = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const mappedVendors = details.map(mapVendorDetailToFilterableVendor);

      setVendorDetailsById((currentDetails) => ({
        ...currentDetails,
        ...Object.fromEntries(details.map((detail) => [detail.id, detail])),
      }));
      setVendorDirectory((currentDirectory) =>
        mergeVendorDirectoryEntries(currentDirectory, mappedVendors),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [missingSelectedVendorDetailIds]);

  const fetchedVendors: FilterableVendor[] = useMemo(
    () => vendorSource,
    [vendorSource],
  );

  const selectedVendors = useMemo(
    () =>
      Array.from(selectedVendorIds)
        .map((vendorId) => vendorDirectory[vendorId])
        .filter((vendor): vendor is FilterableVendor => Boolean(vendor)),
    [selectedVendorIds, vendorDirectory],
  );

  const selectedVendorDispatchTargets = useMemo<VendorDispatchTarget[]>(
    () =>
      Array.from(selectedVendorIds).map((vendorId) => {
        const vendor = vendorDirectory[vendorId];
        const detail = vendorDetailsById[vendorId];

        if (!detail) {
          return buildLoadingVendorDispatchTarget(vendorId, vendor?.name);
        }

        return buildVendorDispatchTarget(
          detail,
          filterCriteria,
          vendorSelectionProfile,
          selectedVendorOfficeIds[vendorId],
        );
      }),
    [
      filterCriteria,
      selectedVendorIds,
      selectedVendorOfficeIds,
      vendorDetailsById,
      vendorDirectory,
      vendorSelectionProfile,
    ],
  );

  const selectedResponseFields = useMemo(
    () => responseFields.filter((field) => field.selected),
    [responseFields],
  );

  const updateQuoteDraft = useCallback(
    (
      targetDepartmentId: string,
      updater: (draft: QuoteDraftState) => QuoteDraftState,
    ) => {
      setQuoteDrafts((prev) => {
        const existingDraft = resolveQuoteDraft(
          targetDepartmentId,
          prev,
          latestInquiryRfqsByDepartment,
          currentInquiry,
        );

        return {
          ...prev,
          [targetDepartmentId]: updater(existingDraft),
        };
      });
    },
    [currentInquiry, latestInquiryRfqsByDepartment],
  );

  useEffect(() => {
    locationSuggestionAppliedRef.current = null;
  }, [departmentId]);

  useEffect(() => {
    if (currentStep !== 3) {
      return;
    }

    const suggestionKey = `${departmentId}::${suggestedLocationSearch}`;
    if (locationSuggestionAppliedRef.current === suggestionKey) {
      return;
    }

    if (
      !usesLocationLookupMode(filterCriteria) ||
      filterCriteria.selectedLocationId ||
      filterCriteria.locationQuery.trim() ||
      !suggestedLocationSearch
    ) {
      locationSuggestionAppliedRef.current = suggestionKey;
      return;
    }

    locationSuggestionAppliedRef.current = suggestionKey;

    updateQuoteDraft(departmentId, (draft) =>
      applySuggestedLocationSearch(
        draft,
        vendorSelectionProfile.recommendedLocationFocus,
        suggestedLocationSearch,
      ),
    );
  }, [
    currentStep,
    departmentId,
    filterCriteria,
    suggestedLocationSearch,
    updateQuoteDraft,
    vendorSelectionProfile.recommendedLocationFocus,
  ]);

  const handleInquiryChange = useCallback(
    (id: string) => {
      setInquiryId(id);
      const nextDepartmentSelection = getDepartmentForInquiry(
        id,
        availableInquiries,
        departmentId,
      );
      if (!nextDepartmentSelection) {
        return;
      }

      const nextInquiryRfqs = rfqs.filter((rfq) => rfq.inquiryId === id);
      const nextDepartmentId = nextDepartmentSelection.nextDepartment.id;

      setQuoteDrafts(
        buildInitialQuoteDraftsForInquiry(
          nextDepartmentSelection.inquiry,
          nextDepartmentId,
          nextInquiryRfqs,
        ),
      );
      setVendorPage(1);
      setDepartmentId(nextDepartmentId);
      setCurrentStep(1);
    },
    [availableInquiries, departmentId, rfqs],
  );

  const handleDepartmentChange = useCallback(
    (id: string) => {
      if (id === departmentId) {
        return;
      }

      const existingDraft = resolveQuoteDraft(
        id,
        quoteDrafts,
        latestInquiryRfqsByDepartment,
        currentInquiry,
      );

      if (!quoteDrafts[id]) {
        setQuoteDrafts((prev) => ({
          ...prev,
          [id]: existingDraft,
        }));
      }

      setVendorPage(1);
      setDepartmentId(id);

      const targetQuoteReady = isQuoteReady(draftedRfqCounts[id]);
      if (currentStep > 1 && !targetQuoteReady) {
        setCurrentStep(1);
      }
    },
    [
      currentInquiry,
      currentStep,
      departmentId,
      draftedRfqCounts,
      latestInquiryRfqsByDepartment,
      quoteDrafts,
    ],
  );

  const handleFieldChange = useCallback(
    (key: string, value: string | string[]) => {
      updateQuoteDraft(departmentId, (draft) =>
        updateQuoteDraftFormValue(draft, key, value),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const toggleResponseField = useCallback(
    (id: string) => {
      updateQuoteDraft(departmentId, (draft) =>
        toggleQuoteDraftResponseField(draft, id),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const addCustomField = useCallback(
    (label: string) => {
      const id = `custom_${Date.now()}`;
      updateQuoteDraft(departmentId, (draft) =>
        addQuoteDraftCustomField(draft, id, label),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const removeCustomField = useCallback(
    (id: string) => {
      updateQuoteDraft(departmentId, (draft) =>
        removeQuoteDraftResponseField(draft, id),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const handleFilterCriteriaChange = useCallback(
    (criteria: VendorFilterCriteria) => {
      setVendorPage(1);
      updateQuoteDraft(departmentId, (draft) =>
        replaceQuoteDraftFilterCriteria(draft, criteria),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const toggleVendor = useCallback(
    (id: string) => {
      updateQuoteDraft(departmentId, (draft) =>
        toggleQuoteDraftVendorSelection(draft, id),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const selectAllVendors = useCallback(() => {
    updateQuoteDraft(departmentId, (draft) =>
      selectQuoteDraftVendors(
        draft,
        fetchedVendors.map((vendor) => vendor.id),
      ),
    );
  }, [departmentId, fetchedVendors, updateQuoteDraft]);

  const deselectAllVendors = useCallback(() => {
    updateQuoteDraft(departmentId, (draft) =>
      deselectQuoteDraftVendors(
        draft,
        fetchedVendors.map((vendor) => vendor.id),
      ),
    );
  }, [departmentId, fetchedVendors, updateQuoteDraft]);

  const clearSelectedVendors = useCallback(() => {
    updateQuoteDraft(departmentId, clearQuoteDraftVendors);
  }, [departmentId, updateQuoteDraft]);

  const handleCustomCcEmailChange = useCallback(
    (value: string) => {
      updateQuoteDraft(departmentId, (draft) =>
        updateQuoteDraftCustomCcEmail(draft, value),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const setSelectedVendorOffice = useCallback(
    (vendorId: string, officeId: string, checked: boolean) => {
      updateQuoteDraft(departmentId, (draft) =>
        setQuoteDraftVendorOfficeSelection(draft, vendorId, officeId, checked),
      );
    },
    [departmentId, updateQuoteDraft],
  );

  const goToPreviousVendorPage = useCallback(() => {
    setVendorPage((currentPage) => Math.max(currentPage - 1, 1));
  }, []);

  const goToNextVendorPage = useCallback(() => {
    setVendorPage((currentPage) =>
      vendorTotalPages > 0
        ? Math.min(currentPage + 1, vendorTotalPages)
        : currentPage + 1,
    );
  }, [vendorTotalPages]);

  const widenVendorScopeToCountry = useCallback(() => {
    if (!filterCriteria.selectedLocationCountryName) {
      return;
    }

    updateQuoteDraft(departmentId, (draft) =>
      setQuoteDraftLocationScope(draft, "COUNTRY"),
    );
    setVendorPage(1);
  }, [
    departmentId,
    filterCriteria.selectedLocationCountryName,
    updateQuoteDraft,
  ]);

  const resetVendorScopeToExact = useCallback(() => {
    if (!filterCriteria.selectedLocationId) {
      return;
    }

    updateQuoteDraft(departmentId, (draft) =>
      setQuoteDraftLocationScope(draft, "EXACT"),
    );
    setVendorPage(1);
  }, [departmentId, filterCriteria.selectedLocationId, updateQuoteDraft]);

  const validateStep = useCallback(
    (step: WizardStep): string | null => {
      return getWizardStepError(step, {
        inquiryId,
        isFormValid: validation.isValid,
        selectedResponseFieldCount: selectedResponseFields.length,
        selectedVendorCount: selectedVendorIds.size,
      });
    },
    [
      inquiryId,
      selectedResponseFields.length,
      selectedVendorIds.size,
      validation.isValid,
    ],
  );

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const goNext = useCallback((): string | null => {
    const error = validateStep(currentStep);
    if (error) return error;
    if (currentStep === 1 && !currentQuoteIsReady) {
      return "Save the current quote tab in step 1 before moving forward.";
    }

    updateQuoteDraft(departmentId, (draft) =>
      markQuoteDraftStepCompleted(draft, currentStep),
    );

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }

    return null;
  }, [
    currentQuoteIsReady,
    currentStep,
    departmentId,
    updateQuoteDraft,
    validateStep,
  ]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  }, [currentStep]);

  const clearAll = useCallback(() => {
    const nextState = createInitialWizardState();
    clearPersistedWizardState();
    setVendorPage(1);
    setCurrentStep(nextState.currentStep);
    setInquiryId(nextState.inquiryId);
    setDepartmentId(nextState.departmentId);
    setQuoteDrafts(nextState.quoteDrafts);
  }, []);

  const buildRfqPayload = useCallback(
    (mailDraft?: RfqPreviewDraft | null, attachments: File[] = []) => {
      if (!inquiryId) {
        throw new ApiError(400, "Please select an inquiry number.");
      }

      const stepOneError = validateStep(1);
      if (stepOneError) {
        throw new ApiError(400, stepOneError);
      }

      const inquiry = availableInquiries.find((item) => item.id === inquiryId);
      const unresolvedDispatchTargets = getUnresolvedDispatchTargets(
        selectedVendorDispatchTargets,
      );

      if (unresolvedDispatchTargets.length > 0) {
        throw new ApiError(
          400,
          "Resolve the sending offices for all selected vendors before sending the RFQ.",
        );
      }

      return {
        inquiry,
        payload: {
          inquiryId,
          inquiryNumber: inquiry?.inquiryNumber ?? inquiryId,
          departmentId,
          formValues,
          vendorIds: Array.from(selectedVendorIds),
          officeSelections: buildRfqOfficeSelections(
            selectedVendorDispatchTargets,
          ),
          responseFields: selectedResponseFields.map((field) => ({
            fieldKey: field.id,
            fieldLabel: field.label,
            isCustom: field.isCustom,
          })),
          customCcEmail: customCcEmail.trim() || undefined,
          mailSubject: mailDraft?.subjectLine,
          mailBodyHtml: mailDraft?.html,
          attachments,
        },
      };
    },
    [
      availableInquiries,
      departmentId,
      formValues,
      inquiryId,
      selectedResponseFields,
      selectedVendorDispatchTargets,
      selectedVendorIds,
      customCcEmail,
      validateStep,
    ],
  );

  const refreshRfqs = useCallback(async () => {
    const latestRfqs = await api.getRfqs();
    setRfqs(latestRfqs);
    return latestRfqs;
  }, []);

  const saveDraftRfq = useCallback(async () => {
    const { payload } = buildRfqPayload();

    setIsSavingDraft(true);
    try {
      await api.createRfq({
        ...payload,
        sendNow: false,
      });
      await refreshRfqs();
      updateQuoteDraft(departmentId, (draft) =>
        markQuoteDraftStepCompleted(draft, 1),
      );
    } finally {
      setIsSavingDraft(false);
    }
  }, [buildRfqPayload, departmentId, refreshRfqs, updateQuoteDraft]);

  const saveRfq = useCallback(
    async (mailDraft?: RfqPreviewDraft | null, attachments: File[] = []) => {
      const { inquiry, payload } = buildRfqPayload(mailDraft, attachments);

      setIsSubmitting(true);
      try {
        await api.createRfq({
          ...payload,
          sendNow: true,
        });

        const latestRfqs = await refreshRfqs();
        const latestOutlookStatus = await api
          .getOutlookStatus()
          .catch(() => null);
        setOutlookStatus(latestOutlookStatus);

        updateQuoteDraft(departmentId, (draft) =>
          markQuoteDraftStepsCompleted(draft, [1, 2, 3, 4]),
        );

        if (!inquiry) {
          clearAll();
          return;
        }

        const nextDepartmentId = getNextRecommendedDepartmentIdAfterSend(
          inquiry,
          latestRfqs,
          departmentId,
        );

        setDepartmentId(nextDepartmentId);
        setCurrentStep(nextDepartmentId === departmentId ? 4 : 1);
      } finally {
        setIsSubmitting(false);
      }
    },
    [buildRfqPayload, clearAll, departmentId, refreshRfqs, updateQuoteDraft],
  );

  return {
    currentStep,
    inquiryId,
    departmentId,
    department,
    currentInquiry,
    quotePlanSummary: quotePlan.summary,
    recommendedQuoteTypes,
    formValues,
    validation,
    responseFields,
    selectedResponseFields,
    filterCriteria,
    customCcEmail,
    fetchedVendors,
    selectedVendors,
    selectedVendorDispatchTargets,
    selectedVendorIds,
    completedSteps,
    availableInquiries,
    vendorLookups,
    vendorSelectionProfile,
    locationOptions,
    isLoadingLocationOptions,
    vendorPage,
    vendorTotal,
    vendorTotalPages,
    isLoadingVendors,
    isSubmitting,
    isSavingDraft,
    outlookStatus,
    handleInquiryChange,
    handleDepartmentChange,
    handleFieldChange,
    toggleResponseField,
    addCustomField,
    removeCustomField,
    setFilterCriteria: handleFilterCriteriaChange,
    setCustomCcEmail: handleCustomCcEmailChange,
    widenVendorScopeToCountry,
    resetVendorScopeToExact,
    toggleVendor,
    selectAllVendors,
    deselectAllVendors,
    clearSelectedVendors,
    setSelectedVendorOffice,
    goToPreviousVendorPage,
    goToNextVendorPage,
    goToStep,
    goNext,
    goBack,
    clearAll,
    validateStep,
    saveDraftRfq,
    saveRfq,
  };
}
