/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import type { Schema } from "@src/@types/Schema";
import type { Field } from "@src/@types/Field";

import ConnectionSchemaParserBase from "@src/plugins/default/ConnectionSchemaPlugin";

export default class ConnectionSchemaParser extends ConnectionSchemaParserBase {
  override parseSchemaToFields(schema: Schema): Field[] {
    const fields = super.parseSchemaToFields(schema);
    const kubeConfigField = fields.find(f => f.name === "kube_config");
    if (kubeConfigField) {
      kubeConfigField.useFile = true;
    }

    return fields;
  }
}
