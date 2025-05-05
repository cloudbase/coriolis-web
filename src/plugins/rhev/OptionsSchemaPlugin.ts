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

import type { Field } from "@src/@types/Field";
import type { OptionValues } from "@src/@types/Endpoint";
import type { SchemaProperties, SchemaDefinitions } from "@src/@types/Schema";
import OptionsSchemaPluginBase, {
  defaultFillMigrationImageMapValues,
  defaultFillFieldValues,
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
} from "../default/OptionsSchemaPlugin";

export default class OptionsSchemaParser extends OptionsSchemaPluginBase {
  override migrationImageMapFieldName = "migr_template_map";

  override parseSchemaToFields(opts: {
    schema: SchemaProperties;
    schemaDefinitions?: SchemaDefinitions | null | undefined;
    dictionaryKey?: string;
    requiresWindowsImage?: boolean;
  }) {
    const fields: Field[] = super.parseSchemaToFields(opts);
    fields.forEach(f => {
      if (
        f.name !== "migr_template_username_map" &&
        f.name !== "migr_template_password_map"
      ) {
        return;
      }

      const password = f.name === "migr_template_password_map";
      f.properties = [
        {
          type: "string",
          name: "windows",
          password,
        },
        {
          type: "string",
          name: "linux",
          password,
        },
      ];
    });

    return fields;
  }

  // @TODO - check if this override is necessary, aka this.migrationImageMapFieldName is used from this class
  override fillFieldValues(opts: {
    field: Field;
    options: OptionValues[];
    requiresWindowsImage: boolean;
  }) {
    const { field, options, requiresWindowsImage } = opts;

    const option = options.find(f => f.name === field.name);
    if (!option) {
      return;
    }
    if (
      !defaultFillMigrationImageMapValues({
        field,
        option,
        migrationImageMapFieldName: this.migrationImageMapFieldName,
        requiresWindowsImage,
      })
    ) {
      defaultFillFieldValues(field, option);
    }
  }

  // @TODO - check if this override is necessary, aka this.migrationImageMapFieldName is used from this class
  override getDestinationEnv(
    options: { [prop: string]: any } | null,
    oldOptions?: any,
  ) {
    const migration_image_map_opt = defaultGetMigrationImageMap(
      options,
      oldOptions,
      this.migrationImageMapFieldName,
    );
    console.log("RHEV Migration image map computation: ");
    console.log(migration_image_map_opt);
    const env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...migration_image_map_opt,
    };
    return env;
  }
}
