import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const db = {
    // Chamada inicial (Mock para manter compatibilidade com o código anterior)
    init: async () => {
        return true;
    },

    getAll: async (table) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`DB Error [getAll ${table}]:`, error);
            return [];
        }
        return data || [];
    },

    get: async (table, id) => {
        return db.getById(table, id);
    },

    getById: async (table, id) => {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
        if (error) {
            console.error(`DB Error [getById ${table}]:`, error);
            return null;
        }
        return data;
    },

    put: async (table, payload) => {
        // Como os antigos dados vinham com ID e os novos precisam gerar UUID ou não enviar o campo ID, trataremos a lógica
        let safePayload = { ...payload };

        if (!safePayload.id) {
            // Inserção nova (Supabase gera o UUID)
            const { data, error } = await supabase.from(table).insert([safePayload]).select().single();
            if (error) throw error;
            return data;
        } else {
            // Atualização (Upsert)
            const { data, error } = await supabase.from(table).upsert(safePayload).select().single();
            if (error) throw error;
            return data;
        }
    },

    delete: async (table, id) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
            console.error(`DB Error [delete ${table}]:`, error);
            return false;
        }
        return true;
    },

    query: async (table, filterFn) => {
        // Para manter 100% de compatibilidade com os filtros JS originais (ex: db.query('prod', p => p.active))
        // baixamos todos os registros de uma tabela e filtramos in-memory na ponta. 
        // OBS: Em uma escala massiva, esse método precisará ser otimizado pra ".eq()" e consultas server-side próprias.
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`DB Error [query ${table}]:`, error);
            return [];
        }
        const allRecords = data || [];
        return allRecords.filter(filterFn);
    }
};

export default db;
