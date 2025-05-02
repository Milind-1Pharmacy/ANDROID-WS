// utils/validateNavigationState.ts
export const validateNavigationState = (state: any): boolean => {
  try {
    return (
      state &&
      typeof state === 'object' &&
      Array.isArray(state.routes) &&
      state.routes.length > 0 &&
      typeof state.index === 'number'
    );
  } catch {
    return false;
  }
};
