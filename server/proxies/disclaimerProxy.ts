/*
Copyright (C) 2025  Cloudbase Solutions SRL
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
import fs from "fs";

const buildError = (message: any) => ({
  error: { message },
});

export default (router: express.Router) => {
  router.get("/disclaimer", async (_, res) => {
    const path = process.env.DISCLAIMER_PATH;
    if (!path) {
      res.json(null);
      return;
    }
    if (!fs.existsSync(path)) {
      res
        .status(500)
        .json(buildError("Disclaimer path not configured properly"));
      return;
    }
    try {
      res.json(fs.readFileSync(path, "utf-8"));
    } catch (err) {
      res.status(500).json(buildError(err.message));
    }
  });
};
