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

import { observable, runInAction, action } from "mobx";
import { ProviderTypes } from "../@types/Providers";
import {
  CustomerInfoBasic,
  CustomerInfoFull,
  CustomerInfoTrial,
  isCustomerInfoFull,
  SetupPageLicenceType,
} from "../@types/InitialSetup";
import lincenceSource from "../sources/LincenceSource";
import configLoader from "../utils/Config";
import ObjectUtils from "../utils/ObjectUtils";

export const customerInfoSetupStoreValueToString = (
  property: keyof CustomerInfoTrial,
  value: string | null
): string => {
  switch (property) {
    case "interestedIn":
      return value === "both" ? "migrations and replicas" : (value as string);
    case "sourcePlatform":
    case "destinationPlatform":
      return value
        ? configLoader.config.providerNames[value as ProviderTypes]
        : "not chosen";
    default:
      return value || "not chosen";
  }
};

class SetupStore {
  @observable
  sendingLicenceRequest = false;

  @observable
  loadingApplianceId = false;

  @observable
  applianceId = "";

  @observable
  applianceIdError = "";

  @action
  async loadApplianceId() {
    this.loadingApplianceId = true;
    try {
      const [ids, status] = await Promise.all([
        lincenceSource.loadAppliancesIds({ quietError: true }),
        lincenceSource.loadLicenceServerStatus({ quietError: true }),
      ]);
      if (!ids.length || ids.length > 1) {
        runInAction(() => {
          if (ids.length > 1) {
            this.applianceIdError =
              "There appears to be multiple Coriolis appliances defined within the licensing server. This is most likely due to a deployment error or failed cleanup, so please contact Cloudbase Support with this information to resolve the issue.";
          }
        });
        return;
      }
      runInAction(() => {
        this.applianceId = `${ids[0]}-licence${status.supported_licence_versions[0]}`;
      });
    } catch (err) {
      this.applianceIdError =
        "There was an error while requesting the appliance ID.";
    } finally {
      runInAction(() => {
        this.loadingApplianceId = false;
      });
    }
  }

  async sendLicenceRequest(
    licenceType: "trial",
    customerInfo: CustomerInfoFull
  ): Promise<void>;

  async sendLicenceRequest(
    licenceType: "paid",
    customerInfo: CustomerInfoBasic
  ): Promise<void>;

  async sendLicenceRequest(
    licenceType: SetupPageLicenceType,
    customerInfo: CustomerInfoFull | CustomerInfoBasic
  ): Promise<void> {
    this.sendingLicenceRequest = true;
    const payload: any = {
      customerInfo,
      licenceType,
      applianceId: this.applianceId,
    };
    if (isCustomerInfoFull(customerInfo)) {
      payload.customerInfo = {
        ...payload.customerInfo,
        interestedIn: customerInfoSetupStoreValueToString(
          "interestedIn",
          customerInfo.interestedIn
        ),
        sourcePlatform: customerInfoSetupStoreValueToString(
          "sourcePlatform",
          customerInfo.sourcePlatform
        ),
        destinationPlatform: customerInfoSetupStoreValueToString(
          "destinationPlatform",
          customerInfo.destinationPlatform
        ),
      };
    }
    try {
      // await ObjectUtils.retry(() => apiCaller.send({
      //   url: '/okokok',
      //   quietError: true,
      // }))
      await ObjectUtils.wait(2000);
      console.log("Sending payload", payload);
      throw new Error("not implemented");
    } finally {
      runInAction(() => {
        this.sendingLicenceRequest = false;
      });
    }
  }
}

export default new SetupStore();
