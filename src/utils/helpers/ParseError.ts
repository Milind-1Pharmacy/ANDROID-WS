export const parseError = (error: any): {status: number; message: string} => {
  try {
    return JSON.parse(error.message);
  } catch {
    return {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};
