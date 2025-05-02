import {getURL} from '@APIRepository';
import APIPost from '../APIHandler/APIPost';
import Methods from '../APIHandler/methods';
import moment from 'moment';

export function putRequestWithS3(URL: string, payload: any, type: string) {
  return fetch(URL, {
    method: Methods.PUT,
    headers: {'Content-Type': type, 'x-amz-acl': 'public-read'},
    body: payload.data,
  });
}

export const uploadFileToS3 = async (
  fileUrl: string,
  data: any,
): Promise<Response> => putRequestWithS3(fileUrl, data, data.type);

export const uploadFileName = async (
  data: unknown,
  APIPost: any,
): Promise<any> => {
  return await APIPost({
    url: getURL({
      key: 'UPLOAD_URL',
      queryParams: {
        platform: 'webstore',
      },
    }),
    body: data,
  });
};

const uploadToS3 = async (fileUrl: string, file: any) => {
  const response = await uploadFileToS3(fileUrl, file);
  if (response.status !== 200)
    throw new Error(`HTTP error: ${response.status}`);
  return response.url.split('?')[0];
};

export const uploadToServer = async (
  file: any,
  APIContext: any = {
    APIPost,
  },
) => {
  const fileData = {
    filename: moment().unix() + '_' + file.name,
  };
  const response = await uploadFileName(fileData, APIContext.APIPost);
  const {data} = response;
  return await uploadToS3(data.uploadUrl, file);
};
