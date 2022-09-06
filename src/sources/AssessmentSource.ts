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

import type { MigrationInfo } from "@src/@types/Assessment";
import Api from "@src/utils/ApiCaller";
import configLoader from "@src/utils/Config";
import notificationStore from "@src/stores/NotificationStore";
import ObjectUtils from "@src/utils/ObjectUtils";
import { MigrationItem } from "@src/@types/MainItem";

class AssessmentSourceUtils {
  static getNetworkMap(data: MigrationInfo) {
    const networkMap: any = {};
    if (data.networks && data.networks.length) {
      data.networks.forEach(mapping => {
        networkMap[mapping.sourceNic.network_name] =
          mapping.targetNetwork!.name;
      });
    }
    return networkMap;
  }

  static getDestinationEnv(data: MigrationInfo) {
    const env: any = {};
    const vmSize =
      data.vmSizes[
        Object.keys(data.vmSizes).filter(
          k => k === data.selectedInstances[0].instance_name
        )[0]
      ];
    if (vmSize) {
      env.vm_size = vmSize;
    }
    const skipFields = [
      "use_replica",
      "separate_vm",
      "shutdown_instances",
      "skip_os_morphing",
    ];
    Object.keys(data.fieldValues)
      .filter(f => !skipFields.find(sf => sf === f))
      .forEach(fieldName => {
        if (data.fieldValues[fieldName] != null) {
          env[fieldName] = data.fieldValues[fieldName];
        }
      });

    return env;
  }
}

class AssessmentSource {
  static migrate(data: MigrationInfo): Promise<MigrationItem> {
    const type = data.fieldValues.use_replica ? "replica" : "migration";
    const payload: any = {};
    payload[type] = {
      origin_endpoint_id: data.source ? data.source.id : "null",
      destination_endpoint_id: data.target.id,
      destination_environment: AssessmentSourceUtils.getDestinationEnv(data),
      instances: data.selectedInstances.map(i => i.instance_name),
      network_map: AssessmentSourceUtils.getNetworkMap(data),
      notes: "",
      replication_count: 2,
    };

    if (type === "migration") {
      payload[type].skip_os_morphing = data.fieldValues.skip_os_morphing;
    }
    return Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/${type}s`,
      method: "POST",
      data: payload,
    }).then(response => response.data[type]);
  }

  static migrateMultiple(data: MigrationInfo): Promise<MigrationItem[]> {
    return Promise.all(
      data.selectedInstances.map(async instance => {
        const newData = { ...data };
        newData.selectedInstances = [instance];
        try {
          return await this.migrate(newData);
        } catch (e) {
          notificationStore.alert(
            `Error while migrating instance ${instance.name}`,
            "error"
          );
          return null;
        }
      })
    ).then(items => items.filter(ObjectUtils.notEmpty).map(i => i));
  }
}

export default AssessmentSource;
