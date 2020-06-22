import type { Cache } from '../@types/Cache'

const MAX_ITEMS = 100
const DEFAULT_MAX_AGE = 30 * 60 * 1000 // 30 minutes
const STORE = 'api-cacher'

class Cacher {
  load(options: {
    key: string,
    maxAge?: number | null,
  }): any {
    const { key, maxAge } = options
    const storage: Cache = JSON.parse(localStorage.getItem(STORE) || '{}')
    const item = storage[key]
    if (!item) {
      return null
    }
    const createdAt = new Date(item.createdAt).getTime()
    const actualMaxAge = (maxAge || DEFAULT_MAX_AGE)
    if (new Date().getTime() - createdAt > actualMaxAge) {
      delete storage[key]
      localStorage.setItem(STORE, JSON.stringify(storage))
      return null
    }
    console.log(`%cFrom cache ${key}`, 'color: #777A8B', item.data)
    return item.data
  }

  save(options: {
    key: string,
    data: any,
  }) {
    const { key, data } = options
    const storage: Cache = JSON.parse(localStorage.getItem(STORE) || '{}')
    const keys = Object.keys(storage)
    if (keys.length >= MAX_ITEMS + 10) {
      keys.sort((a, b) => new Date(storage[a].createdAt)
        .getTime() - new Date(storage[b].createdAt).getTime())
      for (let i = 0; i <= keys.length - MAX_ITEMS; i += 1) {
        delete storage[keys[i]]
      }
    }
    storage[key] = {
      data,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(STORE, JSON.stringify(storage))
  }
}

export default new Cacher()
