/*
Copyright (C) 2019  Cloudbase Solutions SRL
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

import { Field } from "@src/@types/Field";
import type { OptionValues } from "@src/@types/Endpoint";
import type { SchemaProperties, SchemaDefinitions } from "@src/@types/Schema";
import OptionsSchemaPluginBase, {
  defaultFillFieldValues,
  defaultFillMigrationImageMapValues,
  removeExportImageFieldValues,
} from "../default/OptionsSchemaPlugin";

export default class OptionsSchemaParser extends OptionsSchemaPluginBase {
  override parseSchemaToFields(opts: {
    schema: SchemaProperties;
    schemaDefinitions?: SchemaDefinitions | null | undefined;
    dictionaryKey?: string;
    requiresWindowsImage?: boolean;
  }) {
    const fields: Field[] = super.parseSchemaToFields(opts);
    const exportImage = fields
      .find(f => f.name === "coriolis_backups_options")
      ?.properties?.find(p => p.name === "export_image");
    if (exportImage) {
      exportImage.required = true;
    }

    const exportMechField = fields.find(
      f => f.name === "replica_export_mechanism",
    );
    if (!exportMechField) {
      return fields;
    }
    exportMechField.subFields = [];
    exportMechField.enum!.forEach((exportType: any) => {
      const exportTypeFieldIdx = fields.findIndex(
        f => f.name === `${exportType}_options`,
      );
      if (exportTypeFieldIdx === -1) {
        return;
      }
      const subField = fields[exportTypeFieldIdx];
      if (subField.properties?.length) {
        subField.properties = subField.properties.map((p: Field) => ({
          ...p,
          groupName: subField.name,
        }));
      }
      exportMechField.subFields!.push(subField);
      fields.splice(exportTypeFieldIdx, 1);
    });
    return fields;
  }

  override fillFieldValues(opts: {
    field: Field;
    options: OptionValues[];
    requiresWindowsImage: boolean;
  }) {
    const { field, options, requiresWindowsImage } = opts;
    if (field.name === "replica_export_mechanism" && field.subFields) {
      field.subFields.forEach(sf => {
        if (sf.properties) {
          sf.properties.forEach(f => {
            super.fillFieldValues({
              field: f,
              options,
              customFieldName: f.name.split("/")[1],
              requiresWindowsImage,
            });
            removeExportImageFieldValues(f);
          });
        }
      });
    }
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
}
