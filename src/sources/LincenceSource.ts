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
import Api from "@src/utils/ApiCaller";

import configLoader from "@src/utils/Config";
import LicenceUtils from "@src/utils/LicenceUtils";

import type {
  Licence,
  LicenceServerStatus,
  LicenceStats,
} from "@src/@types/Licence";

const parseStats = (body: any): LicenceStats => {
  if (!body) {
    return LicenceUtils.emptyStats();
  }
  const num = (value: any): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return {
    currentPerformedMigrations: num(body.current_performed_migrations),
    currentPerformedReplicas: num(body.current_performed_replicas),
    lifetimePerformedMigrations: num(body.lifetime_performed_migrations),
    lifetimePerformedReplicas: num(body.lifetime_performed_replicas),
    currentAvailableMigrations: num(body.current_available_migrations),
    currentAvailableReplicas: num(body.current_available_replicas),
    lifetimeAvailableMigrations: num(body.lifetime_available_migrations),
    lifetimeAvailableReplicas: num(body.lifetime_available_replicas),
  };
};

class LicenceSource {
  async loadAppliancesIds(config?: {
    skipLog?: boolean;
    quietError?: boolean;
  }): Promise<string[]> {
    const url = `${configLoader.config.servicesUrls.coriolisLicensing}/appliances`;
    const response = await Api.send({
      url,
      quietError: config?.quietError,
      skipLog: config?.skipLog,
    });
    return response.data.appliances.map((a: any) => a.id);
  }

  async loadLicenceServerStatus(config?: {
    skipLog?: boolean;
    quietError?: boolean;
  }): Promise<LicenceServerStatus> {
    const url = `${configLoader.config.servicesUrls.coriolisLicensing}/status`;
    const response = await Api.send({
      url,
      quietError: config?.quietError,
      skipLog: config?.skipLog,
    });
    const status: LicenceServerStatus = response.data.status;
    // newest licence format first:
    status.supported_licence_versions?.sort((a, b) => b.localeCompare(a));
    return status;
  }

  async loadLicenceInfo(
    applianceId: string,
    skipLog?: boolean | null,
  ): Promise<Licence> {
    const url = `${configLoader.config.servicesUrls.coriolisLicensing}/appliances/${applianceId}/status`;
    const response = await Api.send({ url, quietError: true, skipLog });
    const root = response.data.appliance_licence_status;
    if (!root) {
      throw new Error(
        "The licensing server returned no 'appliance_licence_status' body.",
      );
    }
    const licence: Licence = {
      applianceId: root.appliance_id,
      earliestLicenceExpiryDate: new Date(root.earliest_licence_expiry_time),
      latestLicenceExpiryDate: new Date(root.latest_licence_expiry_time),
      standardStats: parseStats(root.standard_licence_stats || root),
      sapStats: parseStats(root.sap_licence_stats),
    };

    return licence;
  }

  async addLicence(licence: string, applianceId: string) {
    const url = `${configLoader.config.servicesUrls.coriolisLicensing}/appliances/${applianceId}/licences`;
    await Api.send({
      url,
      method: "POST",
      headers: { "Content-Type": "application/x-pem-file" },
      data: licence,
    });
  }
}

export default new LicenceSource();
