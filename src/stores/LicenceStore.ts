/*
Copyright (C) 2019  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { observable, action, runInAction } from 'mobx'

import apiCaller from '../utils/ApiCaller'
import licenceSource from '../sources/LincenceSource'

import type { Licence } from '../@types/Licence'

class LicenceStore {
  @observable loadingLicenceInfo: boolean = false

  @observable licenceInfo: Licence | null = null

  @observable addingLicence: boolean = false

  @observable version: string | null = null

  async loadVersion(): Promise<string> {
    if (this.version) {
      return this.version
    }

    const response = await apiCaller.get('/api/version')
    runInAction(() => {
      this.version = response.data.version
    })
    return this.version || ''
  }

  @action async loadLicenceInfo(opts?: { skipLog?: boolean, showLoading?: boolean }) {
    if (opts && opts.showLoading) this.loadingLicenceInfo = true
    try {
      const licence = await licenceSource.loadLicenceInfo(opts && opts.skipLog)
      runInAction(() => {
        this.licenceInfo = licence
        this.loadingLicenceInfo = false
      })
    } catch (ex) {
      runInAction(() => {
        this.loadingLicenceInfo = false
      })
      throw ex
    }
  }

  @action async addLicence(licence: string) {
    this.addingLicence = true
    try {
      await licenceSource.addLicence(licence)
      runInAction(() => {
        this.addingLicence = false
      })
    } catch (ex) {
      runInAction(() => {
        this.addingLicence = false
      })
      throw ex
    }
  }
}

export default new LicenceStore()
