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

import Reflux from 'reflux';
import Api from '../../components/ApiCaller';
import {servicesUrl, defaultDomain} from '../../config';
import Location from '../../core/Location';

let UserAction = Reflux.createActions({
  'login': { children: ["success", "failed"] },
  'logout': {},
  'tokenLogin': { children: ["failed"] },
  'setCurrentUser': {}
})

UserAction.login.listen((userData => {
  let auth = {
    "auth": {
      "identity": {
        "methods": [
          "password"
        ],
        "password": {
          "user": {
            "name": userData.name,
            "domain": {
              "name": userData.domain ? userData.domain : defaultDomain
            },
            "password": userData.password
          }
        }
      },
      scope: {
        project: {
          domain: {
            name: userData.domain ? userData.domain : defaultDomain
          },
          name: userData.name
        }
      }
    }
  }

  Api.setDefaultHeader({ "X-Auth-Token": null })

  Api.sendAjaxRequest({
    url: servicesUrl.identity,
    method: "POST",
    data: auth
  })
    .then((response) => {
      UserAction.login.success(response)
      Location.push('/migrations')
    }, UserAction.login.failed)
    .catch(UserAction.login.failed)
}))

UserAction.tokenLogin.listen((token) => {
  Api.sendAjaxRequest({
      url: servicesUrl.identity,
      method: "GET",
      headers: { 'X-Subject-Token': token }
    })
    .then(UserAction.login.success, UserAction.tokenLogin.failed)
    .catch((response) => {
      UserAction.tokenLogin.failed(response)
    });
})
export default UserAction;
