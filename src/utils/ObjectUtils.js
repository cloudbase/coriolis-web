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

// @flow

class ObjectUtils {
  static flatten(object: any): any {
    let result = {}

    Object.keys(object).forEach(k => {
      if (typeof object[k] === 'object') {
        if (object[k]) {
          result = { ...result, ...this.flatten(object[k]) }
        }
      } else {
        result[k] = object[k]
      }
    })

    if (Object.keys(result).length === 0) {
      return null
    }

    return result
  }

  static skipField(object: any, fieldName: string) {
    let result = {}

    if (Object.keys(object).length === 0) {
      return null
    }

    Object.keys(object).forEach(k => {
      if (k !== fieldName) {
        result[k] = object[k]
      }
    })

    if (Object.keys(result).length === 0) {
      return null
    }

    return result
  }

  static waitFor(predicate: () => boolean, timeout?: number = 15000): Promise<void> {
    let start = new Date().getTime()
    let test = () => new Promise((resolve, reject) => {
      if (predicate()) {
        resolve()
        return
      }
      setTimeout(() => {
        if (new Date().getTime() - start < timeout) {
          test()
        } else {
          reject(`Timeout: waiting for more than ${timeout} ms`)
        }
      }, 1000)
    })
    return test()
  }
}

export default ObjectUtils
