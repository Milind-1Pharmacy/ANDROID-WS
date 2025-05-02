import APIFetch from './APIFetch';
import Methods from './methods';
import {APIPatchParams} from './types';

const APIPatch = async (params: APIPatchParams) => {
  try {
    const response = await APIFetch({
      method: Methods.PATCH,
      url: params.url,
      body: params.body,
      customHeaders: params.customHeaders,
    });

    const responseData = response.data;
    (params.resolve || (() => {}))(responseData);
    return responseData;
  } catch (error) {
    (params.reject || (() => {}))(error);
    return error;
  }
};


export default APIPatch;
