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

// @flow

import { observable, action, runInAction } from 'mobx'

import licenceSource from '../sources/LincenceSource'
import type { Licence } from '../types/Licence'

class LicenceStore {
  @observable loadingLicenceInfo: boolean = false
  @observable licenceInfo: ?Licence = null
  @observable addingLicence: boolean = false

  @action async loadLicenceInfo() {
    this.loadingLicenceInfo = true
    try {
      let licence = await licenceSource.loadLicenceInfo()
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
