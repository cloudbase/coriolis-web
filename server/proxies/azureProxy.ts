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

import express from "express";

import MsRest from "ms-rest-azure";
import axios from "axios";

const forwardHeaders = ["authorization"];

const buildError = (message: any) => ({
  error: { message: `Proxy - ${message}` },
});

export default (router: express.Router) => {
  router.post("/azure/login", (req, res) => {
    const handleResponse = (err: any, credentials: any) => {
      if (err) {
        console.log(err);
        res.status(401).send(buildError("Azure API authentication error"));
      } else {
        res.send(credentials);
      }
    };
    const connInfo = req.body;
    const userCred = connInfo.user_credentials;
    const servicePrin = connInfo.service_principal_credentials;
    if (userCred && userCred.username && userCred.password) {
      MsRest.loginWithUsernamePassword(
        userCred.username,
        userCred.password,
        handleResponse
      );
    } else if (
      servicePrin &&
      servicePrin.client_id &&
      servicePrin.client_secret
    ) {
      MsRest.loginWithServicePrincipalSecret(
        servicePrin.client_id,
        servicePrin.client_secret,
        connInfo.tenant,
        handleResponse
      );
    } else {
      res.status(401).send(buildError("Azure API authentication error"));
    }
  });

  router.get("/azure/*", (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const url = Buffer.from(
      req.url.substr("/proxy/".length),
      "base64"
    ).toString();
    const headers: any = {};
    forwardHeaders.forEach(headerName => {
      if (req.headers[headerName] != null) {
        headers[headerName] = req.headers[headerName];
      }
    });

    axios({ url, headers })
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        if (error.response) {
          res
            .status(error.response.status)
            .send(buildError(error.response.data.error.message));
        } else if (error.request) {
          console.log(error);
          res.status(500).send(buildError("No Response!"));
        } else {
          res.status(500).send(buildError("Error creating request!"));
        }
      });
  });
};
