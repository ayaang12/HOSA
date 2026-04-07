const noop = async () => ({})

const entityApi = {
  filter: async () => [],
  list: async () => [],
  get: async () => null,
  create: noop,
  update: noop,
  delete: noop,
};

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: new Proxy({}, {
    get: () => entityApi,
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
    },
  },
};

export const base44 = db;
export default db;
