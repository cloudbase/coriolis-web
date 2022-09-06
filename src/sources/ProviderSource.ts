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

import Api from "@src/utils/ApiCaller";
import { providerTypes } from "@src/constants";
import configLoader from "@src/utils/Config";
import type { Field } from "@src/@types/Field";
import type { Providers, ProviderTypes } from "@src/@types/Providers";
import type { OptionValues } from "@src/@types/Endpoint";
import DomUtils from "@src/utils/DomUtils";
import { SchemaParser } from "./Schemas";

class ProviderSource {
  async getConnectionInfoSchema(providerName: ProviderTypes): Promise<Field[]> {
    const response = await Api.get(
      `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${providerTypes.CONNECTION}`
    );
    let schema = response.data.schemas.connection_info_schema;
    schema = SchemaParser.connectionSchemaToFields(providerName, schema);
    return schema;
  }

  async loadProviders(): Promise<Providers> {
    const response = await Api.get(
      `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers`
    );
    return response.data.providers;
  }

  async loadOptionsSchema(opts: {
    providerName: ProviderTypes;
    optionsType: "source" | "destination";
    useCache?: boolean | null;
    quietError?: boolean | null;
    requiresWindowsImage?: boolean;
  }): Promise<Field[]> {
    const {
      providerName,
      optionsType,
      useCache,
      quietError,
      requiresWindowsImage,
    } = opts;
    const schemaTypeInt =
      optionsType === "source"
        ? providerTypes.SOURCE_REPLICA
        : providerTypes.TARGET_REPLICA;

    try {
      const response = await Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${schemaTypeInt}`,
        cache: useCache,
        quietError,
      });
      const schema =
        optionsType === "source"
          ? response?.data?.schemas?.source_environment_schema
          : response?.data?.schemas?.destination_environment_schema;
      let fields = [];
      if (schema) {
        fields = SchemaParser.optionsSchemaToFields({
          provider: providerName,
          schema,
          dictionaryKey: `${providerName}-${optionsType}`,
          requiresWindowsImage,
        });
      }
      return fields;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getOptionsValues(opts: {
    optionsType: "source" | "destination";
    endpointId: string;
    envData: { [prop: string]: any } | null | undefined;
    cache?: boolean | null;
    quietError?: boolean;
  }): Promise<OptionValues[]> {
    const { optionsType, endpointId, envData, cache, quietError } = opts;
    let envString = "";
    if (envData) {
      envString = `?env=${DomUtils.encodeToBase64Url(envData)}`;
    }
    const callName =
      optionsType === "source" ? "source-options" : "destination-options";
    const fieldName =
      optionsType === "source" ? "source_options" : "destination_options";

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/${callName}${envString}`,
      cache,
      cancelId: endpointId,
      quietError,
    });
    return response.data[fieldName];
  }
}

export default new ProviderSource();
