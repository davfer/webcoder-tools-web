import { NetworkCallLog } from '../types';

type Listener = (logs: NetworkCallLog[]) => void;

class NetworkTracker {
  private logs: NetworkCallLog[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    try {
      const saved = localStorage.getItem('webcoder_network_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  public getCount(): number {
    return this.logs.length;
  }

  public getLogs(): NetworkCallLog[] {
    return [...this.logs];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    try {
      localStorage.setItem('webcoder_network_logs', JSON.stringify(this.logs.slice(-50)));
    } catch {
      // ignore storage quota
    }
    this.listeners.forEach((fn) => fn([...this.logs]));
  }

  public recordCall(log: Omit<NetworkCallLog, 'id' | 'timestamp'>): NetworkCallLog {
    const entry: NetworkCallLog = {
      ...log,
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs.unshift(entry);
    if (this.logs.length > 100) {
      this.logs.pop();
    }
    this.notify();
    return entry;
  }

  public clear() {
    this.logs = [];
    this.notify();
  }

  public async trackRequest<T>(
    url: string,
    method: string,
    action: () => Promise<{ response?: Response; data?: T; details?: string }>
  ): Promise<{ data?: T; status: number | string; durationMs: number; error?: string; details?: string }> {
    const start = performance.now();
    try {
      const res = await action();
      const durationMs = Math.round(performance.now() - start);
      const status = res.response ? res.response.status : 200;
      const statusText = res.response ? res.response.statusText : 'OK';

      this.recordCall({
        url,
        method,
        durationMs,
        status,
        statusText,
        details: res.details,
      });

      return {
        data: res.data,
        status,
        durationMs,
        details: res.details,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      const errorMsg = err?.message || 'Network request failed';

      this.recordCall({
        url,
        method,
        durationMs,
        status: 'FAILED',
        error: errorMsg,
        details: 'Blocked by CORS or unreachable network host',
      });

      return {
        status: 'FAILED',
        durationMs,
        error: errorMsg,
      };
    }
  }
}

export const networkTracker = new NetworkTracker();
