/* ============================================================
   HitCell Macaé — Central Database Layer
   Uses IndexedDB for persistent, structured storage
   ============================================================ */

const DB_NAME = 'hitcell_macae_db';
const DB_VERSION = 1;

let dbInstance = null;

const STORES = [
    'settings', 'users', 'employees', 'roles', 'permissions',
    'customers', 'addresses', 'categories', 'products', 'product_images',
    'product_variations', 'suppliers', 'purchases', 'purchase_items',
    'inventory', 'inventory_movements', 'reservations',
    'carts', 'cart_items', 'orders', 'order_items', 'deliveries',
    'payments', 'transactions',
    'service_requests', 'service_orders', 'service_diagnostics',
    'service_quotes', 'service_parts', 'warranties',
    'revenues', 'expenses', 'accounts_payable', 'accounts_receivable',
    'cash_registers', 'cash_movements',
    'banners', 'site_content', 'promotions', 'coupons',
    'testimonials', 'faq', 'pages',
    'notifications', 'audit_log', 'favorites',
    'payment_integrations'
];

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            STORES.forEach(name => {
                if (!db.objectStoreNames.contains(name)) {
                    const store = db.createObjectStore(name, { keyPath: 'id' });
                    store.createIndex('created_at', 'created_at', { unique: false });
                    if (['products', 'orders', 'service_orders', 'customers', 'inventory_movements'].includes(name)) {
                        store.createIndex('status', 'status', { unique: false });
                    }
                    if (name === 'products') {
                        store.createIndex('category_id', 'category_id', { unique: false });
                        store.createIndex('active', 'active', { unique: false });
                    }
                    if (name === 'orders' || name === 'payments') {
                        store.createIndex('customer_id', 'customer_id', { unique: false });
                    }
                    if (name === 'users') {
                        store.createIndex('email', 'email', { unique: true });
                    }
                    if (name === 'cart_items' || name === 'order_items') {
                        store.createIndex('product_id', 'product_id', { unique: false });
                    }
                    if (name === 'inventory_movements') {
                        store.createIndex('product_id', 'product_id', { unique: false });
                    }
                    if (name === 'audit_log') {
                        store.createIndex('user_id', 'user_id', { unique: false });
                        store.createIndex('entity_type', 'entity_type', { unique: false });
                    }
                }
            });
        };
    });
}

// Generic CRUD operations
export const db = {
    async getAll(storeName) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async getById(storeName, id) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    async getByIndex(storeName, indexName, value) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async getOneByIndex(storeName, indexName, value) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(value);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    async put(storeName, data) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const now = new Date().toISOString();
            const record = {
                ...data,
                id: data.id || crypto.randomUUID(),
                created_at: data.created_at || now,
                updated_at: now
            };
            const request = store.put(record);
            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    },

    async delete(storeName, id) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    async count(storeName) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async clear(storeName) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    async query(storeName, filterFn) {
        const all = await this.getAll(storeName);
        return all.filter(filterFn);
    },

    async aggregate(storeName, field, filterFn) {
        let items = await this.getAll(storeName);
        if (filterFn) items = items.filter(filterFn);
        return items.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
    }
};

export default db;
