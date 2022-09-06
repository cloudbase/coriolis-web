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
import path from "path";

import apiRouter from "./api/router";
import proxyRouter from "./proxies/router";

export default () => {
  const app = express();

  const PORT = process.env.PORT || 3000;

  app.use(express.static("dist"));

  app.use("/proxy", proxyRouter);

  app.use("/api", apiRouter);

  app.get("*", (_, res) => {
    res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Express server is up on port ${PORT}`);
  });
};
