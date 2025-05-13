export const parseError = (error: any): {status: number; message: string} => {
  // console.log('ERROR2==========', parseError(error));
  try {
    return JSON.parse(error.message);
  } catch {
    return {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};
