export const isSuccessfulLivenessResponse = (result: any): boolean => {
  if (result?.success !== true) return false;

  if (result.liveness) {
    return result.liveness.success !== false;
  }

  return result.passed === true;
};
