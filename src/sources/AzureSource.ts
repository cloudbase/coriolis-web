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

import moment from "moment";

import Api from "@src/utils/ApiCaller";
import type { Assessment, VmItem, VmSize } from "@src/@types/Assessment";
import DomUtils from "@src/utils/DomUtils";

const azureUrl = "https://management.azure.com/";
const defaultApiVersion = "2019-10-01";

const resourceGroupsUrl = (opts: { subscriptionId: string }) =>
  `/subscriptions/${opts.subscriptionId}/resourceGroups`;
const projectsUrl = ({ resourceGroupName, ...other }: any) =>
  `${resourceGroupsUrl({
    ...other,
  })}/${resourceGroupName}/providers/Microsoft.Migrate/assessmentprojects`;
const groupsUrl = ({ projectName, ...other }: any) =>
  `${projectsUrl({ ...other })}/${projectName}/groups`;
const assessmentsUrl = ({ groupName, ...other }: any) =>
  `${groupsUrl({ ...other })}/${groupName}/assessments`;
const assessmentDetailsUrl = ({ assessmentName, ...other }: any) =>
  `${assessmentsUrl({ ...other })}/${assessmentName}`;
const assessedVmsUrl = ({ ...other }) =>
  `${assessmentDetailsUrl({ ...other })}/assessedMachines`;

class Util {
  static buildUrl(baseUrl: string, apiVersion?: string): string {
    const url = `/proxy/azure/${DomUtils.encodeToBase64Url(
      `${azureUrl + baseUrl}?api-version=${apiVersion || defaultApiVersion}`
    )}`;
    return url;
  }

  static sortAssessments(assessments: any[]) {
    assessments.sort(
      (a: any, b: any) =>
        moment(b.properties.updatedTimestamp).toDate().getTime() -
        moment(a.properties.updatedTimestamp).toDate().getTime()
    );
    return assessments;
  }

  static checkQueues(queues: any[], requestIds: any, callback: any) {
    if (requestIds[0] !== requestIds[1]) {
      return;
    }

    const doneQeues = queues.filter(q => q === 0).length;
    if (doneQeues === queues.length) {
      callback();
    }
  }

  static isResponseValid(response: any): boolean {
    if (response && response.data && response.data.error) {
      const error = response.data.error;
      console.error("%c", "color: #D0021B", `${error.code}: ${error.message}`);
      return false;
    }
    return true;
  }

  static validateResponse(response: any, resolveData: any): Promise<any> {
    if (!this.isResponseValid(response)) {
      return Promise.reject();
    }

    if (resolveData) {
      return Promise.resolve(resolveData);
    }
    return Promise.resolve(response);
  }
}

class AzureSource {
  static authenticate(connectionInfo: any): Promise<any> {
    return Api.send({
      url: "/proxy/azure/login",
      method: "POST",
      data: connectionInfo,
    }).then(response => {
      const entries = Object.keys(response.data.tokenCache)[0];
      const accessToken = response.data.tokenCache[entries][0].accessToken;
      Api.setDefaultHeader("Authorization", `Bearer ${accessToken}`);
      return response.data;
    });
  }

  static getResourceGroups(
    subscriptionId: string
  ): Promise<Assessment["group"][]> {
    return Api.get(
      Util.buildUrl(resourceGroupsUrl({ subscriptionId }), "2017-08-01")
    ).then(response => Util.validateResponse(response, response.data.value));
  }

  static previousReqId: string;

  static async getAssessments(
    subscriptionId: string,
    resourceGroupName: string,
    skipLog?: boolean | null
  ): Promise<Assessment[]> {
    const cancelId = subscriptionId + resourceGroupName;
    if (this.previousReqId) {
      Api.cancelRequests(this.previousReqId);
    }
    this.previousReqId = cancelId;

    // Load Projects
    let projects: any[] = [];
    const projectsResponse = await Api.send({
      url: Util.buildUrl(projectsUrl({ resourceGroupName, subscriptionId })),
      cancelId,
      skipLog,
    });
    if (!Util.isResponseValid(projectsResponse)) {
      projects = [];
    }
    projects = projectsResponse.data.value.filter(
      (p: any) => p.type === "Microsoft.Migrate/assessmentprojects"
    );

    // Load groups for each project
    const groupsResponses = await Promise.all(
      projects.map(async (project: any) => {
        let groups: any[] | null = null;

        const groupsResponse = await Api.send({
          url: Util.buildUrl(
            groupsUrl({
              projectName: project.name,
              subscriptionId,
              resourceGroupName,
            })
          ),
          cancelId,
        });
        if (!Util.isResponseValid(groupsResponse)) {
          groups = null;
        }
        groups = groupsResponse.data.value.map((group: any) => ({
          ...group,
          project,
        }));
        return groups;
      })
    );

    let groups: any[] = [];
    groupsResponses
      .filter(r => r !== null)
      .forEach(validGroupsReponse => {
        groups = groups.concat(validGroupsReponse);
      });

    // Load assessments for each group
    return Promise.all(
      groups.map(group =>
        Api.send({
          url: Util.buildUrl(
            assessmentsUrl({
              subscriptionId,
              resourceGroupName,
              projectName: group.project.name,
              groupName: group.name,
            })
          ),
          cancelId,
        }).then(assessmentResponse => {
          if (!Util.isResponseValid(assessmentResponse)) {
            return null;
          }
          return assessmentResponse.data.value.map(
            (assessment: Assessment) => ({
              ...assessment,
              group,
              project: group.project,
              properies: {
                ...assessment.properties,
                azureLocation:
                  assessment.properties.azureLocation.toLowerCase(),
              },
            })
          );
        })
      )
    );
  }

  static async getAssessmentDetails(info: Assessment): Promise<Assessment> {
    const response = await Api.get(
      Util.buildUrl(
        assessmentDetailsUrl({
          ...info,
          subscriptionId: info.connectionInfo.subscription_id,
        })
      )
    );
    const assessment: Assessment = await Util.validateResponse(response, {
      ...response.data,
      ...info,
    });
    assessment.properties.azureLocation =
      assessment.properties.azureLocation.toLowerCase();
    return assessment;
  }

  static getAssessedVms(info: Assessment): Promise<VmItem[]> {
    return Api.get(
      Util.buildUrl(
        assessedVmsUrl({
          ...info,
          subscriptionId: info.connectionInfo.subscription_id,
        })
      )
    ).then(response => {
      if (!Util.isResponseValid(response)) {
        return [];
      }

      const vms = response.data.value;
      vms.sort((a: any, b: any) => {
        const getLabel = (item: any) => item.properties.displayName;
        return getLabel(a).localeCompare(getLabel(b));
      });
      return vms;
    });
  }

  static getVmSizes(info: Assessment): Promise<VmSize[]> {
    return Api.get(
      Util.buildUrl(
        `/subscriptions/${info.connectionInfo.subscription_id}/providers/Microsoft.Compute/locations/${info.location}/vmSizes`,
        "2017-12-01"
      )
    ).then(response => Util.validateResponse(response, response.data.value));
  }
}

export default AzureSource;
