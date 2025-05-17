export const serverVersions = {
  prod: {
    baseURL: 'https://apiv2.1pharmacy.io/prod/',
    gAPIKey: 'AIzaSyCGZpIJMhCKyOrCmGH1BkAa38BTxfOX5JQ',
  },
  beta: {
    baseURL: 'https://apiv2.1pharmacy.io/beta/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
  test: {
    baseURL: 'https://apiv2.1pharmacy.io/test/',
    gAPIKey: 'AIzaSyCGZpIJMhCKyOrCmGH1BkAa38BTxfOX5JQ',
  },
  stagging: {
    baseURL: 'https://apiv2.1pharmacy.io/stagging/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
};

export const currentServerVersion: keyof typeof serverVersions = 'test';
