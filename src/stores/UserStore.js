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

import alt from '../alt'
import UserActions from '../actions/UserActions'

class UserStore {
  constructor() {
    this.user = null
    this.loading = false
    this.loginFailedResponse = null

    this.bindListeners({
      handleLogin: UserActions.LOGIN,
      handleLoginFailed: UserActions.LOGIN_FAILED,
      handleLoginScopedSuccess: UserActions.LOGIN_SCOPED_SUCCESS,
      handleLoginScopedFailed: UserActions.LOGIN_SCOPED_FAILED,
      handleTokenLogin: UserActions.TOKEN_LOGIN,
      handleTokenLoginSuccess: UserActions.TOKEN_LOGIN_SUCCESS,
      handleTokenLoginFailed: UserActions.TOKEN_LOGIN_FAILED,
      handleGetUserInfoSuccess: UserActions.GET_USER_INFO_SUCCESS,
    })
  }

  handleLogin() {
    this.loading = true
    this.user = null
    this.loginFailedResponse = null
  }

  handleLoginFailed(response) {
    this.loading = false
    this.loginFailedResponse = response
  }

  handleLoginScopedSuccess(data) {
    this.user = { ...data, scoped: true }
    this.loading = false
  }

  handleLoginScopedFailed(response) {
    this.user = null
    this.loading = false
    this.loginFailedResponse = response
  }

  handleTokenLogin() {
    this.user = null
    this.loading = true
  }

  handleTokenLoginSuccess(data) {
    this.user = { ...data, scoped: true }
    this.loading = false
  }

  handleTokenLoginFailed() {
    this.user = null
    this.loading = false
  }

  handleGetUserInfoSuccess(user) {
    this.user = { ...this.user, ...user }
  }
}

export default alt.createStore(UserStore)
