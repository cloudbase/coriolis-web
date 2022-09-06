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

import { OptionsSchemaPlugin } from "@src/plugins";
import LabelDictionary from "@src/utils/LabelDictionary";
import { ProviderTypes } from "./Providers";

type Separator = { separator: boolean };
type EnumItemObject = {
  label?: string;
  value?: unknown;
  name?: string;
  id?: string | null;
  disabled?: boolean;
  subtitleLabel?: string;
  [key: string]: unknown;
};
export const isEnumSeparator = (e: any): e is Separator =>
  typeof e !== "string" && e.separator === true;

export type EnumItem = string | EnumItemObject | Separator;
export type Field = {
  name: string;
  type?: string;
  value?: any;
  label?: string;
  enum?: EnumItem[];
  default?: any;
  password?: boolean;
  disabled?: boolean;
  nullableBoolean?: boolean;
  items?: Field[];
  fields?: Field[];
  minimum?: number;
  maximum?: number;
  parent?: string;
  properties?: Field[];
  required?: boolean;
  useTextArea?: boolean;
  useFile?: boolean;
  readOnly?: boolean;
  title?: string;
  description?: string;
  warning?: string;
  subFields?: Field[];
  groupName?: string;
};

const migrationImageOsTypes = ["windows", "linux"];

class FieldHelper {
  getValueAlias(opts: {
    name: string;
    value: any;
    fields: Field[];
    targetProvider: ProviderTypes | null | undefined;
  }): string {
    const { name, value, fields, targetProvider } = opts;
    const plugin = targetProvider && OptionsSchemaPlugin.for(targetProvider);

    if (value === true) {
      return "Yes";
    }
    if (value === false) {
      return "No";
    }
    const findField = (f: Field[]) => f.find(f1 => f1.name === name);
    let field = findField(fields);
    if (!field) {
      fields.forEach(f => {
        if (f.properties && !field) {
          field = findField(f.properties);
        }

        if (f.subFields && !field) {
          field = findField(f.subFields);
          if (f.subFields && !field) {
            f.subFields.forEach(sf => {
              if (!field && sf.properties) {
                field = findField(sf.properties);
              }
            });
          }
        }
      });
    }
    const findInEnum = (v: any) => {
      let valueName = v;
      if (field && field.enum) {
        const enumObject: any = field.enum.find((e: any) =>
          e.id ? e.id === v : false
        );
        if (enumObject && enumObject.name) {
          valueName = enumObject.name;
        } else if (
          field &&
          LabelDictionary.enumFields.find(f => field && f === field.name)
        ) {
          valueName = LabelDictionary.get(v);
        }
      }
      return valueName;
    };
    if (value.join) {
      return value.map((v: any) => findInEnum(v)).join(", ");
    }

    const isImageMapField = migrationImageOsTypes.find(os => os === name);
    if (isImageMapField) {
      const migrImageField =
        plugin &&
        fields.find(f => f.name === plugin.migrationImageMapFieldName);
      if (migrImageField && migrImageField.properties) {
        const imageField = migrImageField.properties.find(p => p.name === name);
        if (imageField && imageField.enum) {
          const imageFieldValueObject: any = imageField.enum.find((e: any) =>
            e.id ? e.id === value : false
          );
          if (imageFieldValueObject) {
            return imageFieldValueObject.name;
          }
        }
      }
    }

    return findInEnum(value);
  }
}

export default new FieldHelper();
