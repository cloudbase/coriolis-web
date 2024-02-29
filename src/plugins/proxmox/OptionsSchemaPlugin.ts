/*
Copyright (C) 2021  Cloudbase Solutions SRL
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

import type { Field } from "@src/@types/Field";
import type { SchemaProperties, SchemaDefinitions } from "@src/@types/Schema";
import OptionsSchemaPluginBase from "../default/OptionsSchemaPlugin";

export default class OptionsSchemaParser extends OptionsSchemaPluginBase {
  override parseSchemaToFields(opts: {
    schema: SchemaProperties;
    schemaDefinitions?: SchemaDefinitions | null | undefined;
    dictionaryKey?: string;
    requiresWindowsImage?: boolean;
  }) {
    return super.parseSchemaToFields(opts);
  }

  override sortFields(fields: Field[]) {
    super.sortFields(fields);
    fields.sort((f1, f2) => {
      // sort import node field first
      if (f1.name === "import_node") {
        return -1;
      }
      if (f2.name === "import_node") {
        return 1;
      }
      return 0;
    });
  }
}
