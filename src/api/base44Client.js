import { supabase } from '@/lib/supabaseClient';

const TABLE_MAP = {
  Patient: 'patients',
  Alert: 'alerts',
  VitalReading: 'vital_readings',
};

const parseSortParam = (sortBy) => {
  if (!sortBy) return { column: 'created_at', ascending: false };
  const desc = sortBy.startsWith('-');
  const raw = desc ? sortBy.slice(1) : sortBy;
  const column = raw === 'created_date' ? 'created_at'
    : raw === 'updated_date' ? 'updated_at'
    : raw;
  return { column, ascending: !desc };
};

const makeEntityApi = (entityName) => {
  const table = TABLE_MAP[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  return {
    async list(sortBy, limit) {
      const { column, ascending } = parseSortParam(sortBy);
      let query = supabase.from(table).select('*').order(column, { ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data.map(normalizeRow);
    },

    async filter(filters, sortBy, limit) {
      const { column, ascending } = parseSortParam(sortBy);
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
      query = query.order(column, { ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data.map(normalizeRow);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeRow(data) : null;
    },

    async create(payload) {
      const row = denormalizePayload(payload);
      const { data, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return normalizeRow(data);
    },

    async update(id, payload) {
      const row = denormalizePayload(payload);
      row.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from(table)
        .update(row)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeRow(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
  };
};

function normalizeRow(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

function denormalizePayload(payload) {
  const row = { ...payload };
  delete row.created_date;
  delete row.updated_date;
  delete row.id;
  return row;
}

const entityCache = {};

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: new Proxy({}, {
    get(_, entityName) {
      if (!entityCache[entityName]) {
        entityCache[entityName] = makeEntityApi(entityName);
      }
      return entityCache[entityName];
    },
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
    },
  },
};

export const base44 = db;
export default db;
