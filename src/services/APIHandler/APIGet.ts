import React from 'react';
import APIFetch from './APIFetch';
import Methods from './methods';
import {APIGetParams} from './types';

const APIGet = async (params: APIGetParams) => {
  try {
    const response = await APIFetch({
      method: Methods.GET,
      url: params.url,
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

export default APIGet;
