// @flow

import type { Cache } from '../types/Cache'

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
    storage[key] = {
      data,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORE, JSON.stringify(storage))
  }
}

export default new Cacher()
