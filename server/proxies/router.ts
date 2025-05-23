/*
Copyright (C) 2022  Cloudbase Solutions SRL
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
import bodyParser from "body-parser";
import metalHubProxy from "./metalHubProxy";
import azureProxy from "./azureProxy";
import disclaimerProxy from "./disclaimerProxy";

const router = express.Router();

router.use(bodyParser.json());

azureProxy(router);
metalHubProxy(router);
disclaimerProxy(router);

export default router;
