export type APIBaseParams = {
  method: string;
  url: string;
  body?: any | undefined;
  customHeaders?: any | undefined;
};

export type PromiseHandlers = {
  resolve?: Function | undefined;
  reject?: Function | undefined;
};

export type APIGetParams = Omit<
  APIBaseParams & PromiseHandlers,
  'method' | 'body'
>;

export type APIPostParams = Omit<APIBaseParams & PromiseHandlers, 'method'>;

export type APIPutParams = Omit<APIBaseParams & PromiseHandlers, 'method'>;

export type APIPatchParams = Omit<APIBaseParams & PromiseHandlers, 'method'>;

export type APIDeleteParams = Omit<APIBaseParams & PromiseHandlers, 'method'>;
