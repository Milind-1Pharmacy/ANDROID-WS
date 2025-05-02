import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

import {APIBaseParams} from './types';

async function APIFetch({method, url, body, customHeaders}: APIBaseParams) {
  const headers = {
    // Host: config.host,
    // Connection: 'Keep-Alive',
    // 'Accept-Encoding': 'gzip',
    // 'User-Agent': 'okhttp/4.10.0',
    'X-App-Mode': 'B2C',
    ...customHeaders,
  };

  const axiosConfig: AxiosRequestConfig = {
    method: method,
    url: url,
    headers: headers,
    data: body,
  };

  try {
    const response: AxiosResponse = await axios(axiosConfig);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorResponse = error.response.data;
      const userMessage =
        errorResponse.error?.userMessage || 'An error occurred';
      throw new Error(
        JSON.stringify({
          status: error.response.status,
          message: userMessage,
        }),
      );
    }
    throw error;
  }
}

export default APIFetch;
