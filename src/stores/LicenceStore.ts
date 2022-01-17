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

import licenceSource from '@src/sources/LincenceSource'

import type { Licence, LicenceServerStatus } from '@src/@types/Licence'

class LicenceStore {
  @observable loadingLicenceInfo: boolean = false

  @observable licenceInfo: Licence | null = null

  @observable licenceServerStatus: LicenceServerStatus | null = null

  @observable addingLicence: boolean = false

  @observable licenceInfoError: string | null = null

  @action async loadLicenceInfo(opts?: { skipLog?: boolean, showLoading?: boolean }) {
    if (opts?.showLoading && !this.licenceInfo && !this.licenceInfoError) {
      this.loadingLicenceInfo = true
    }
    try {
      const ids = await licenceSource.loadAppliancesIds(opts?.skipLog)
      if (!ids.length || ids.length > 1) {
        runInAction(() => {
          if (ids.length > 1) {
            this.licenceInfoError = 'There appears to be multiple Coriolis appliances defined within the licensing server. This is most likely due to a deployment error or failed cleanup, so please contact Cloudbase Support with this information to resolve the issue.'
          }
          this.loadingLicenceInfo = false
        })
        return
      }
      const applianceId = ids[0]
      const [licenceServerStatus, licenceInfo] = await Promise.all([
        licenceSource.loadLicenceServerStatus(opts?.skipLog),
        licenceSource.loadLicenceInfo(applianceId, opts?.skipLog),
      ])
      runInAction(() => {
        this.licenceInfoError = null
        this.licenceInfo = licenceInfo
        this.licenceServerStatus = licenceServerStatus
        this.loadingLicenceInfo = false
      })
    } catch (err) {
      runInAction(() => {
        this.licenceInfoError = `There was an error contacting Coriolis® Licensing Server. Request status: ${err.status}\nPlease contact Coriolis® Support.`
      })
    } finally {
      runInAction(() => {
        this.loadingLicenceInfo = false
      })
    }
  }

  @action async addLicence(licence: string, applianceId: string) {
    this.addingLicence = true
    try {
      await licenceSource.addLicence(licence, applianceId)
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
