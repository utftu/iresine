export function setQueryDataNotCopy(queryClient, queryKey, data) {
  const oldOptions = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({
    ...oldOptions,
    queries: {
      ...oldOptions.queries,
      structuralSharing: false,
    },
  });
  const result = queryClient.setQueryData(queryKey, data);
  queryClient.setDefaultOptions(oldOptions);
  return result;
}
