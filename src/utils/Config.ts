import type { Config } from '@src/@types/Config'
import apiCaller from './ApiCaller'

class ConfigLoader {
  config!: Config

  isFirstLaunch!: boolean

  async load() {
    const res = await apiCaller.get('/api/config')
    this.config = res.data.config
    this.isFirstLaunch = res.data.isFirstLaunch
  }

  async setNotFirstLaunch() {
    await apiCaller.send({
      url: '/api/config/first-launch',
      method: 'POST',
      data: { isFirstLaunch: false },
    })
    this.isFirstLaunch = false
  }

  async setInitialAdminPassword(password: string) {
    await apiCaller.send({
      url: '/api/config/admin-password',
      method: 'POST',
      data: { password },
    })
  }
}

export default new ConfigLoader()
