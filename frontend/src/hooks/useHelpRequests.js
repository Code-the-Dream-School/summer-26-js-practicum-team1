import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getBrowseHelpRequests,
  getCategoryFacets,
  createHelpRequest,
  getVolunteerAcceptedRequests,
  getAcceptedVolunteerProfile,
  getHelpRequestById,
} from '../services/api';

export function useBrowseHelpRequests(filters) {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['help-requests', filters],
    queryFn: () => getBrowseHelpRequests(filters),
    placeholderData: (previousData) => previousData,
  });

  return {
    helpRequests: data?.data || [],
    meta: data?.meta,
    isLoading,
    isFetching,
    isError,
    error,
  };
}

export function useCategoryFacets(filters) {
  const {
    data: categoryCounts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['help-requests-facets', filters],
    queryFn: () => getCategoryFacets(filters),
    placeholderData: (previousData) => previousData,
  });

  return {
    categoryCounts: categoryCounts || {},
    isLoading,
    isError,
    error,
  };
}

export function useHelpRequests() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ data, csrfToken }) => createHelpRequest(data, csrfToken),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['helpRequests'],
      });
    },
  });

  return {
    createHelpRequest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}

export function useAcceptedVolunteerProfile(requestId, enabled = true) {
  const query = useQuery({
    queryKey: ['accepted-volunteer-profile', requestId],
    queryFn: () => getAcceptedVolunteerProfile(requestId),
    enabled: Boolean(requestId) && enabled,
  });

  return {
    volunteer: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

export function useVolunteerAcceptedRequests() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['volunteer-accepted-requests'],
    queryFn: getVolunteerAcceptedRequests,
  });

  return {
    helpRequests: data || [],
    isLoading,
    isFetching,
  };
}

export function useHelpRequest(requestId) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['help-request', requestId],
    queryFn: () => getHelpRequestById(requestId),
    enabled: requestId != null,
  });

  return {
    helpRequest: data,
    isLoading,
    isError,
    error,
  };
}
