// @flow

import apiCaller from './ApiCaller'

import type { Config } from '../types/Config'

class ConfigLoader {
  config: Config

  load() {
    return apiCaller.get('/config').then(res => {
      this.config = res.data
    })
  }
}

export default new ConfigLoader()
