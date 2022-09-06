import { Field } from "@src/@types/Field";
import DomUtils from "@src/utils/DomUtils";

export default class MinionPoolSchemaPluginBase {
  getMinionPoolToOptionsQuery(envData?: unknown) {
    let envString = "";
    if (envData) {
      envString = `?env=${DomUtils.encodeToBase64Url(envData)}`;
    }
    return envString;
  }

  minionPoolTransformOptionsFields(fields: Field[]) {
    return fields;
  }

  getMinionPoolEnv(schema: Field[], data: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};
    schema.forEach(field => {
      if (
        data[field.name] === null ||
        data[field.name] === undefined ||
        data[field.name] === ""
      ) {
        if (field.default !== null) {
          payload[field.name] = field.default;
        }
      } else {
        payload[field.name] = data[field.name];
      }
    });
    return payload;
  }
}
