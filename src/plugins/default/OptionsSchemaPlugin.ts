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

import Utils from "@src/utils/ObjectUtils";

import { Field, isEnumSeparator } from "@src/@types/Field";
import type { OptionValues, StorageMap } from "@src/@types/Endpoint";
import type { SchemaProperties, SchemaDefinitions } from "@src/@types/Schema";
import type { NetworkMap } from "@src/@types/Network";
import type { InstanceScript } from "@src/@types/Instance";
import { executionOptions, migrationFields } from "@src/constants";
import { UserScriptData } from "@src/@types/MainItem";
import { defaultSchemaToFields } from "./ConnectionSchemaPlugin";

const migrationImageOsTypes = ["windows", "linux"];

export const defaultFillFieldValues = (field: Field, option: OptionValues) => {
  if (field.type === "string") {
    field.enum = [...option.values];
    if (option.config_default) {
      field.default =
        typeof option.config_default === "string"
          ? option.config_default
          : option.config_default.id;
    }
  }
  if (field.type === "array") {
    field.enum = [...option.values];
  }
  if (field.type === "boolean" && option.config_default != null) {
    field.default =
      typeof option.config_default === "boolean"
        ? option.config_default
        : option.config_default === "true";
  }
};

export const removeExportImageFieldValues = (field: Field) => {
  if (field.name === "export_image") {
    field.enum = field.enum?.filter(exportImageValue => {
      if (
        typeof exportImageValue === "string" ||
        isEnumSeparator(exportImageValue)
      ) {
        return true;
      }
      const isLinux =
        exportImageValue.os_type === "linux" ||
        exportImageValue.os_type === "unknown";
      if (!isLinux) {
        field.warning = "Only Linux images are listed.";
      }
      return isLinux;
    });
  }
};

export const defaultFillMigrationImageMapValues = (opts: {
  field: Field;
  option: OptionValues;
  migrationImageMapFieldName: string;
  requiresWindowsImage: boolean;
}): boolean => {
  const { field, option, migrationImageMapFieldName, requiresWindowsImage } =
    opts;
  if (field.name !== migrationImageMapFieldName) {
    return false;
  }
  field.properties = migrationImageOsTypes.map(os => {
    const values = (option.values as any)
      .filter(
        (v: { os_type: string }) => v.os_type === os || v.os_type === "unknown"
      )
      .sort((v1: { os_type: string }, v2: { os_type: string }) => {
        if (v1.os_type === "unknown" && v2.os_type !== "unknown") {
          return 1;
        }
        if (v1.os_type !== "unknown" && v2.os_type === "unknown") {
          return -1;
        }
        return 0;
      });
    const unknownIndex = values.findIndex(
      (v: { os_type: string }) => v.os_type === "unknown"
    );
    if (
      unknownIndex > -1 &&
      values.filter((v: { os_type: string }) => v.os_type === "unknown")
        .length < values.length
    ) {
      values.splice(unknownIndex, 0, { separator: true });
    }

    let defaultValue = null;
    if (
      option?.config_default &&
      Object.prototype.hasOwnProperty.call(option.config_default, os)
    ) {
      // @ts-ignore
      defaultValue = option.config_default[os];
    }

    return {
      name: os,
      type: "string",
      enum: values,
      default: defaultValue,
      required: os === "linux" || (requiresWindowsImage && os === "windows"),
    };
  });
  return true;
};

export const defaultGetDestinationEnv = (
  options?: { [prop: string]: any } | null,
  oldOptions?: { [prop: string]: any } | null
): any => {
  const env: any = {};
  const specialOptions = [
    "execute_now",
    "execute_now_options",
    "separate_vm",
    "skip_os_morphing",
    "title",
    "minion_pool_id",
  ]
    .concat(migrationFields.map(f => f.name))
    .concat(executionOptions.map(o => o.name))
    .concat(migrationImageOsTypes);

  if (!options) {
    return env;
  }

  Object.keys(options).forEach(optionName => {
    const value = options[optionName];
    const oldValue = oldOptions?.[optionName];
    const noValue =
      (value == null || value === "") && (oldValue == null || oldValue === "");
    if (specialOptions.find(o => o === optionName) || noValue) {
      return;
    }
    if (Array.isArray(value)) {
      env[optionName] = value;
    } else if (typeof value === "object" && value != null) {
      const oldValue = oldOptions?.[optionName] || {};
      const mergedValue: any = { ...oldValue, ...value };
      const newValue: any = {};
      Object.keys(mergedValue).forEach(k => {
        if (mergedValue[k] !== null) {
          newValue[k] = mergedValue[k];
        }
      });
      env[optionName] = newValue;
    } else {
      env[optionName] = options ? Utils.trim(optionName, value) : null;
    }
  });
  return env;
};

export const defaultGetMigrationImageMap = (
  options: { [prop: string]: any } | null | undefined,
  oldOptions: any,
  migrationImageMapFieldName: string
) => {
  const env: any = {};
  const usableOptions = options;
  if (!usableOptions) {
    return env;
  }

  const hasMigrationMap = Object.keys(usableOptions).find(
    k => k === migrationImageMapFieldName
  );
  if (!hasMigrationMap) {
    return env;
  }
  migrationImageOsTypes.forEach(os => {
    let value = usableOptions[migrationImageMapFieldName][os];

    // Make sure the migr. image mapping has all the OSes filled,
    // even if only one OS mapping was updated,
    // ie. don't send just the updated OS map to the server, send them all if one was updated.
    if (!value) {
      value = oldOptions?.[migrationImageMapFieldName]?.[os];
      if (!value) {
        return;
      }
    }

    if (!env[migrationImageMapFieldName]) {
      env[migrationImageMapFieldName] = {};
    }

    env[migrationImageMapFieldName][os] = value;
  });

  return env;
};

export default class OptionsSchemaParserBase {
  migrationImageMapFieldName = "migr_image_map";

  parseSchemaToFields(opts: {
    schema: SchemaProperties;
    schemaDefinitions?: SchemaDefinitions | null;
    dictionaryKey?: string;
    requiresWindowsImage?: boolean;
  }) {
    const { schema, schemaDefinitions, dictionaryKey } = opts;
    return defaultSchemaToFields(schema, schemaDefinitions, dictionaryKey);
  }

  sortFields(fields: Field[]) {
    fields.sort((a, b) => {
      if (a.required && !b.required) {
        return -1;
      }

      if (!a.required && b.required) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }

  fillFieldValues(opts: {
    field: Field;
    options: OptionValues[];
    requiresWindowsImage: boolean;
    customFieldName?: string;
  }) {
    const { field, options, requiresWindowsImage, customFieldName } = opts;

    const option = options.find(f =>
      customFieldName ? f.name === customFieldName : f.name === field.name
    );
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

  getDestinationEnv(
    options?: { [prop: string]: any } | null,
    oldOptions?: any
  ) {
    const env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...defaultGetMigrationImageMap(
        options,
        oldOptions,
        this.migrationImageMapFieldName
      ),
    };
    return env;
  }

  getNetworkMap(networkMappings: NetworkMap[] | null | undefined) {
    const payload: any = {};
    if (!networkMappings?.length) {
      return payload;
    }
    const hasSecurityGroups = Boolean(
      networkMappings.find(nm => nm.targetNetwork!.security_groups)
    );
    networkMappings.forEach(mapping => {
      let target;
      if (hasSecurityGroups) {
        target = {
          id: mapping.targetNetwork!.id,
          security_groups: mapping.targetSecurityGroups
            ? mapping.targetSecurityGroups.map(s =>
                typeof s === "string" ? s : s.id
              )
            : [],
        };
      } else if (mapping.targetPortKey != null) {
        target = `${mapping.targetNetwork!.id}:${mapping.targetPortKey}`;
      } else {
        target = mapping.targetNetwork!.id;
      }
      payload[mapping.sourceNic.network_name] = target;
    });
    return payload;
  }

  getStorageMap(
    defaultStorage:
      | { value: string | null; busType?: string | null }
      | undefined,
    storageMap?: StorageMap[] | null,
    configDefault?: string | null
  ) {
    if (!defaultStorage?.value && !storageMap) {
      return null;
    }

    const payload: any = {};
    if (defaultStorage?.value) {
      payload.default = defaultStorage.value;
      if (defaultStorage.busType) {
        payload.default += `:${defaultStorage.busType}`;
      }
    }

    if (!storageMap) {
      return payload;
    }

    storageMap.forEach(mapping => {
      if (mapping.target.id === null && !configDefault) {
        return;
      }

      const getDestination = () => {
        let destination =
          mapping.target.id === null ? configDefault : mapping.target.name;
        if (mapping.targetBusType) {
          destination += `:${mapping.targetBusType}`;
        }
        return destination;
      };

      if (mapping.type === "backend") {
        if (!payload.backend_mappings) {
          payload.backend_mappings = [];
        }
        payload.backend_mappings.push({
          source: mapping.source.storage_backend_identifier,
          destination: getDestination(),
        });
      } else {
        if (!payload.disk_mappings) {
          payload.disk_mappings = [];
        }
        payload.disk_mappings.push({
          disk_id: mapping.source.id.toString(),
          destination: getDestination(),
        });
      }
    });
    return payload;
  }

  getUserScripts(
    uploadedUserScripts: InstanceScript[],
    removedUserScripts: InstanceScript[],
    userScriptData: UserScriptData | null | undefined
  ) {
    const payload: any = userScriptData || {};

    const setPayload = (
      scripts: InstanceScript[],
      scriptProp: "global" | "instanceId",
      payloadProp: "global" | "instances"
    ) => {
      if (!scripts.length) {
        return;
      }
      payload[payloadProp] = payload[payloadProp] || {};
      scripts.forEach(script => {
        const scriptValue = script[scriptProp];
        if (!scriptValue) {
          throw new Error(
            `The uploaded script structure is missing the '${scriptProp}' property`
          );
        }
        payload[payloadProp][scriptValue] = script.scriptContent;
      });
    };

    setPayload(
      removedUserScripts.filter(s => s.global),
      "global",
      "global"
    );
    setPayload(
      removedUserScripts.filter(s => s.instanceId),
      "instanceId",
      "instances"
    );
    setPayload(
      uploadedUserScripts.filter(s => s.global),
      "global",
      "global"
    );
    setPayload(
      uploadedUserScripts.filter(s => s.instanceId),
      "instanceId",
      "instances"
    );

    return payload;
  }
}
