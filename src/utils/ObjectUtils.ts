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

import configLoader from './Config'

export type FileContent = {
  name: string,
  content: string,
}

class ObjectUtils {
  static notEmpty<T>(value: T | null | undefined): value is T {
    return value != null
  }

  static flatten(object: any, appendParentPath?: boolean, parent?: string): any {
    let result: any = {}

    Object.keys(object).forEach(k => {
      if (typeof object[k] === 'object' && !Array.isArray(object[k])) {
        if (object[k]) {
          result = {
            ...result,
            ...this.flatten(object[k], appendParentPath, k),
          }
        }
      } else {
        let key = k
        if (appendParentPath && parent) {
          key = `${parent}/${k}`
        }
        result[key] = object[k]
      }
    })

    if (Object.keys(result).length === 0) {
      return null
    }

    return result
  }

  static skipFields(object: any, fieldNames: string[]) {
    const result: any = {}

    if (Object.keys(object).length === 0) {
      return null
    }

    Object.keys(object).forEach(k => {
      if (!fieldNames.find(fn => fn === k)) {
        result[k] = object[k]
      }
    })

    if (Object.keys(result).length === 0) {
      return null
    }

    return result
  }

  static async wait(ms: number) {
    return new Promise<void>(r => { setTimeout(() => r(), ms) })
  }

  static async waitFor(predicate: () => boolean, timeoutMs: number = 15000, tryEvery: number = 1000) {
    const startTime = new Date().getTime()
    const testLoop = async () => {
      if (predicate()) {
        return
      }
      if (new Date().getTime() - startTime > timeoutMs) {
        throw new Error(`Timeout: waiting for more than ${timeoutMs} ms`)
      }
      await this.wait(tryEvery)
      await testLoop()
    }
    await testLoop()
  }

  static trim(fieldName: string, value: any): any {
    const isPassword = configLoader.config.passwordFields.find(p => p === fieldName)
      || fieldName.toLowerCase().indexOf('password') > -1
    return typeof value === 'string' && !isPassword ? value.trim() : value
  }

  static capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}

export default ObjectUtils
