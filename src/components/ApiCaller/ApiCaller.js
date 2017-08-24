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
/* eslint-disable */

import React, { Component } from 'react';
import NotificationActions from '../../actions/NotificationActions';
import Location from '../../core/Location';

let apiInstance = null

class ApiCaller {
  defaultHeaders = {
    "Content-Type": "application/json"
  }

  constructor() {
    if(!apiInstance){
      apiInstance = this;
    }

    return apiInstance;
  }


  sendAjaxRequest(options) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      //request.withCredentials = true
      request.open(options.method, options.url);

      let headers = Object.assign({}, this.defaultHeaders)

      if (options.headers) {
        for (var key in options.headers) {
          headers[key] = options.headers[key]
        }
      }

      for (name in headers) {
        request.setRequestHeader(name, headers[name])
      }

      request.onreadystatechange = () => {
        if (request.readyState === 4) {   //if complete
          if (!(request.status >= 200 && request.status <= 299)) {  //check if "OK" (200)
            reject({ status: request.status });
          }
        }
      }

      console.log(`Sending ${options.method} Request to ${options.url}`);
      try {
        options.data ? request.send(JSON.stringify(options.data)) : request.send();
      }
      catch (err) {
        reject(err)
      }

      request.onload = () => {
        let result = {
          status: request.status,
          data: request.responseText ?
            (options.json !== false ? JSON.parse(request.responseText) : request.responseText): null,
          headers: ApiCaller.processHeaders(request.getAllResponseHeaders())
        };
        if (result.status >= 200 && result.status <= 299) {
          console.log(`Response ${options.url}`, result.data)
          resolve(result);
        } else {
          console.log(`Error Response: ${options.url}`, result.data);
          if (result.data && result.data.error && result.data.error.message) {
            NotificationActions.notify(result.data.error.message, "error")
          }
          if (result.status == 401) {
            this.resetHeaders()
            window.location.href = "/"
          }
          reject({ status: request.status });
        }
      };

      request.onerror = () => {
        console.log('Error Response: ', result.data);
        reject({ status: 500, data: 'Connection error' });
      }
    });
  }

  resetHeaders() {
    this.defaultHeaders = {
      "Content-Type": "application/json"
    }
  }

  static processHeaders(rawHeaders) {
    let headers = {}
    let lines = rawHeaders.split("\n");
    lines.forEach(line => {
      let comps = line.split(':')
      if (comps[0].length) {
        headers[comps[0]] = comps[1].trim()
      }
    })
    return headers
  }

  setDefaultHeader(name, value) {
    if (value == null) {
      delete this.defaultHeaders[name]
    } else {
      this.defaultHeaders[name] = value
    }

  }
}

export default new ApiCaller;
