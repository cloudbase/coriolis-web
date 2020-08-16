/*
Copyright (C) 2020  Cloudbase Solutions SRL
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
import { Region } from '../@types/Region'
import regionSource from '../sources/RegionSource'

class RegionStore {
  @observable regions: Region[] = []

  @observable loading = false

  @action async getRegions() {
    this.loading = true
    try {
      const regions = await regionSource.getRegions()
      runInAction(() => {
        this.regions = regions
      })
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }
}

export default new RegionStore()
