type SyncMessage = {
  type: 'LOGOUT' | 'LOGIN'
  timestamp: number
}

class SyncService {
  private channel: BroadcastChannel | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('auth_sync')
      this.channel.onmessage = (event) => {
        const message = event.data as SyncMessage
        if (message.type === 'LOGOUT') {
          this.notifyLogout()
        }
      }
    }
  }

  broadcastLogout() {
    this.channel?.postMessage({
      type: 'LOGOUT',
      timestamp: Date.now()
    } as SyncMessage)
    this.notifyLogout()
  }

  onLogout(callback: () => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyLogout() {
    this.listeners.forEach(callback => callback())
  }
}

export const syncService = new SyncService() 