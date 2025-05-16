export const serverVersions = {
  prod: {
    baseURL: 'https://apiv2.1pharmacy.io/prod/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
  beta: {
    baseURL: 'https://apiv2.1pharmacy.io/beta/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
  test: {
    baseURL: 'https://apiv2.1pharmacy.io/test/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
  stagging: {
    baseURL: 'https://apiv2.1pharmacy.io/stagging/',
    gAPIKey: 'AIzaSyC9WxuSfeQjf2gfwftW9K8mGvC7WtBkvRc',
  },
};

export const currentServerVersion: keyof typeof serverVersions = 'test';
