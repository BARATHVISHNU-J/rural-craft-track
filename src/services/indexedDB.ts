// IndexedDB service for offline storage
interface ArtisanData {
  id: string;
  name: string;
  leaderId: string;
  performanceMetric: 'worst' | 'okay' | 'great';
  productsCreated: number;
  qualityCheck: number;
  amountToPay: number;
  skillsAdded: string[];
}

interface Order {
  id: string;
  type: 'toys' | 'embroidery' | 'bags';
  numberOfProducts: number;
  deadline: string;
  leaderId: string;
  status: 'active' | 'pending';
  createdAt: string;
}

interface Leader {
  id: string;
  name: string;
  phone: string;
  numberOfArtisans: number;
  ordersReceived: number;
  currentOrderId: string;
  performanceScore: number;
  location: string;
  orderType: 'toys' | 'embroidery' | 'bags';
}

class IndexedDBService {
  private dbName = 'ArtisanManagementDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('artisans')) {
          db.createObjectStore('artisans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('leaders')) {
          db.createObjectStore('leaders', { keyPath: 'id' });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Artisan methods
  async saveArtisans(artisans: ArtisanData[]): Promise<void> {
    const store = await this.getStore('artisans', 'readwrite');
    artisans.forEach(artisan => {
      store.put(artisan);
    });
  }

  async getArtisans(): Promise<ArtisanData[]> {
    const store = await this.getStore('artisans');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getArtisansByLeader(leaderId: string): Promise<ArtisanData[]> {
    const artisans = await this.getArtisans();
    return artisans.filter(artisan => artisan.leaderId === leaderId);
  }

  // Order methods
  async saveOrders(orders: Order[]): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    orders.forEach(order => {
      store.put(order);
    });
  }

  async getOrders(): Promise<Order[]> {
    const store = await this.getStore('orders');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addOrder(order: Order): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Leader methods
  async saveLeaders(leaders: Leader[]): Promise<void> {
    const store = await this.getStore('leaders', 'readwrite');
    leaders.forEach(leader => {
      store.put(leader);
    });
  }

  async getLeaders(): Promise<Leader[]> {
    const store = await this.getStore('leaders');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // CSV Export functionality
  generateCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const dbService = new IndexedDBService();
export type { ArtisanData, Order, Leader };