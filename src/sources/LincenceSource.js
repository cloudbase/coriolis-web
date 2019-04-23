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
import Api from '../utils/ApiCaller'

import { servicesUrl } from '../constants'

import type { Licence } from '../types/Licence'

class LicenceSource {
  async loadLicenceInfo(): Promise<Licence> {
    let url = `${servicesUrl.licence}/licence-status`
    let response = await Api.send({ url })
    let root = response.data.licence_status
    return ({
      currentPeriodStart: new Date(root.current_period_start),
      currentPeriodEnd: new Date(root.current_period_end),
      performedMigrations: root.performed_migrations,
      performedReplicas: root.performed_replicas,
      totalMigations: root.total_migrations,
      totalReplicas: root.total_replicas,
    })
  }

  async addLicence(licence: string) {
    let url = `${servicesUrl.licence}/licences`
    await Api.send({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-pem-file' },
      data: licence,
    })
  }
}

export default new LicenceSource()
