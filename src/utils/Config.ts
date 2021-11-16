import type { Config } from '@src/@types/Config'
import apiCaller from './ApiCaller'

class ConfigLoader {
  config!: Config

  async load() {
    const res = await apiCaller.get('/api/config')
    this.config = res.data
  }
}

export default new ConfigLoader()
