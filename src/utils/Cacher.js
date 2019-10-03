// @flow

import type { Cache } from '../types/Cache'

const MAX_ITEMS = 100

const DEFAULT_MAX_AGE = 15 * 60 * 1000 // 15 minutes
const STORE = 'api-cacher'

class Cacher {
  load(options: {
    key: string,
    maxAge?: ?number,
  }): ?any {
    let { key, maxAge } = options
    let storage: Cache = JSON.parse(localStorage.getItem(STORE) || '{}')
    let item = storage[key]
    if (!item) {
      return null
    }
    let createdAt = new Date(item.createdAt).getTime()
    let actualMaxAge = (maxAge || DEFAULT_MAX_AGE)
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
    let { key, data } = options
    let storage: Cache = JSON.parse(localStorage.getItem(STORE) || '{}')
    let keys = Object.keys(storage)
    if (keys.length >= MAX_ITEMS + 10) {
      keys.sort((a, b) => new Date(storage[a].createdAt).getTime() - new Date(storage[b].createdAt).getTime())
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
