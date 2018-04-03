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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import { servicesUrl } from '../config'
import type { Credentials, User } from '../types/User'

class UserModel {
  static parseUserData(response) {
    let data = {
      id: response.data.token.user.id,
      name: response.data.token.user.name,
      email: response.data.token.user.email,
      project: response.data.token.project,
    }

    return data
  }
}

class UserSource {
  static login(userData: Credentials): Promise<User> {
    let auth = {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              name: userData.name,
              domain: { name: 'default' },
              password: userData.password,
            },
          },
        },
        scope: 'unscoped',
      },
    }

    Api.setDefaultHeader('X-Auth-Token', null)

    return new Promise((resolve, reject) => {
      Api.sendAjaxRequest({
        url: servicesUrl.identity,
        method: 'POST',
        data: auth,
      }).then((response) => {
        let token = response.headers['X-Subject-Token'] || response.headers['x-subject-token']
        Api.setDefaultHeader('X-Auth-Token', token)
        cookie.set('unscopedToken', token, { expires: 30 })
        resolve(response)
      }, reject).catch(reject)
    })
  }

  static loginScoped(projectId: string, skipCookie?: boolean): Promise<User> {
    let useProjectId = skipCookie ? projectId : cookie.get('projectId') || projectId
    let token = cookie.get('unscopedToken')

    let auth = {
      auth: {
        identity: {
          methods: ['token'],
          token: {
            id: token,
          },
        },
        scope: {
          project: {
            id: useProjectId,
          },
        },
      },
    }

    Api.setDefaultHeader('X-Auth-Token', null)

    return new Promise((resolve, reject) => {
      Api.sendAjaxRequest({
        url: servicesUrl.identity,
        method: 'POST',
        data: auth,
      }).then((response) => {
        let token = response.headers['X-Subject-Token'] || response.headers['x-subject-token']
        let data = UserModel.parseUserData(response)
        data = { ...data, token }
        cookie.set('token', data.token, { expires: 30 })
        cookie.set('projectId', data.project.id, { expires: 30 })
        Api.setDefaultHeader('X-Auth-Token', data.token)

        resolve(data)
      }, response => {
        if (!skipCookie) {
          UserSource.loginScoped(projectId, true).then(resolve, reject)
        } else {
          reject(response)
        }
      }).catch(reject)
    })
  }

  static tokenLogin(): Promise<User> {
    let token = cookie.get('token')
    let projectId = cookie.get('projectId')
    if (token) {
      Api.setDefaultHeader('X-Auth-Token', token)
    }

    return new Promise((resolve, reject) => {
      if (!token || !projectId) {
        reject()
        return
      }
      Api.sendAjaxRequest({
        url: servicesUrl.identity,
        method: 'GET',
        headers: { 'X-Subject-Token': token },
      }).then(response => {
        let data = UserModel.parseUserData(response)
        data = { ...data, token }
        resolve(data)
      }, () => {
        cookie.remove('token')
        cookie.remove('projectId')
        Api.resetHeaders()
        reject()
      }).catch(() => {
        cookie.remove('token')
        cookie.remove('projectId')
        Api.resetHeaders()
        reject()
      })
    })
  }

  static switchProject(): Promise<void> {
    let token = cookie.get('unscopedToken')
    return new Promise((resolve, reject) => {
      if (token) {
        cookie.remove('projectId')
        resolve()
      } else {
        reject()
      }
    })
  }

  static logout(): Promise<void> {
    let token = cookie.get('token')

    return new Promise((resolve, reject) => {
      Api.sendAjaxRequest({
        url: servicesUrl.identity,
        method: 'DELETE',
        headers: { 'X-Subject-Token': token },
      }).then(() => {
        cookie.remove('token')
        window.location.href = '/'
        resolve()
      }, reject).catch(() => {
        cookie.remove('token')
        window.location.href = '/'
        reject()
      })

      Api.resetHeaders()
    })
  }

  static getUserInfo(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      Api.sendAjaxRequest({
        url: `${servicesUrl.users}/${user.id}`,
        method: 'GET',
      }).then((response) => {
        resolve(response.data.user)
      }, reject).catch(reject)
    })
  }
}

export default UserSource
