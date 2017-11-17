/*
Copyright (C) 2017  Cloudbase Solutions SRL
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

import moment from 'moment'

class DateUtils {
  static getLocalTime(rawDate) {
    let offset = (new Date().getTimezoneOffset() / 60) * -1

    return moment(rawDate).add(offset, 'hours')
  }

  static getUtcTime(rawDate) {
    let offset = (new Date().getTimezoneOffset() / 60)
    return moment(rawDate).add(offset, 'hours')
  }

  static getLocalHour(hour) {
    let hourDate = new Date(2017, 0, 1, hour)
    return moment(hourDate).add(-hourDate.getTimezoneOffset(), 'minutes').get('hours')
  }

  static getUtcHour(hour) {
    let hourDate = new Date(2017, 0, 1, hour)
    return moment(hourDate).add(hourDate.getTimezoneOffset(), 'minutes').get('hours')
  }

  static getOrdinalDay(number) {
    switch (number) {
      case 1:
      case 21:
        return `${number}st`
      case 2:
      case 22:
        return `${number}nd`
      case 3:
      case 23:
        return `${number}rd`
      default:
        return `${number}th`
    }
  }
}

export default DateUtils
