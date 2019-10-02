// @flow

import apiCaller from './ApiCaller'

import type { Config } from '../types/Config'

class ConfigLoader {
  config: Config

  async load() {
    let res = await apiCaller.get('/api/config')
    this.config = res.data
  }
}

export default new ConfigLoader()
