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

import { observable, runInAction, action } from "mobx";
import cookie from "js-cookie";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import type { Log } from "@src/@types/Log";

import configLoader from "@src/utils/Config";

import apiCaller from "@src/utils/ApiCaller";
import DateUtils from "@src/utils/DateUtils";
import DomUtils from "@src/utils/DomUtils";
import ObjectUtils from "@src/utils/ObjectUtils";
import notificationStore from "./NotificationStore";

const MAX_STREAM_LINES = 200;

const generateUrlForLog = (
  logName: string,
  startDate?: Date | null,
  endDate?: Date | null
): string => {
  const token = cookie.get("token") || "null";
  let url = `${configLoader.config.servicesUrls.coriolisLogs}/${logName}?auth_type=keystone&auth_token=${token}`;
  if (startDate) {
    url += `&start_date=${DateUtils.toUnix(startDate)}`;
  }
  if (endDate) {
    url += `&end_date=${DateUtils.toUnix(endDate)}`;
  }
  return url;
};

const downloadDiagnosticsIntoZip = async (zipRef: JSZip): Promise<void> => {
  const baseUrl = `${configLoader.config.servicesUrls.coriolis}/${apiCaller.projectId}`;
  const [diagnosticsResp, transfersResp, deploymentsResp] = await Promise.all([
    apiCaller.send({ url: `${baseUrl}/diagnostics` }),
    apiCaller.send({ url: `${baseUrl}/transfers?show_deleted=true` }),
    apiCaller.send({ url: `${baseUrl}/deployments?show_deleted=true` }),
  ]);

  zipRef.file("diagnostics.json", JSON.stringify(diagnosticsResp.data));
  zipRef.file("transfers.json", JSON.stringify(transfersResp.data));
  zipRef.file("deployments.json", JSON.stringify(deploymentsResp.data));
};

class LogStore {
  @observable logs: Log[] = [];

  @observable loading = false;

  @observable liveFeed: string[] = [];

  @observable generatingDiagnostics = false;

  @observable downloadingAllLogs = false;

  @action async getLogs(options?: { showLoading?: boolean }) {
    if (options && options.showLoading) {
      this.loading = true;
    }
    try {
      const response = await apiCaller.send({
        url: configLoader.config.servicesUrls.coriolisLogs,
      });
      runInAction(() => {
        this.logs = response.data.logs;
        this.loading = false;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  @action async downloadAll(startDate?: Date | null, endDate?: Date | null) {
    this.downloadingAllLogs = true;
    await ObjectUtils.waitFor(() => this.logs.length > 0);
    const logFilesResponses = await Promise.all(
      this.logs.map(async log => ({
        name: log.log_name,
        content: await apiCaller.send({
          url: generateUrlForLog(log.log_name, startDate, endDate),
        }),
      }))
    );
    const zip = new JSZip();
    logFilesResponses.forEach(response => {
      zip.file(`${response.name}.log`, response.content.data);
    });
    await downloadDiagnosticsIntoZip(zip);
    const zipContent = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    saveAs(zipContent, "logs.zip");
    runInAction(() => {
      this.downloadingAllLogs = false;
    });
  }

  @action download(
    logName: string,
    startDate?: Date | null,
    endDate?: Date | null
  ) {
    DomUtils.executeDownloadLink(
      generateUrlForLog(logName, startDate, endDate)
    );
  }

  @action async downloadDiagnostics() {
    this.generatingDiagnostics = true;
    const zip = new JSZip();
    await downloadDiagnosticsIntoZip(zip);
    const zipContent = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    saveAs(zipContent, "diagnostics.zip");
    runInAction(() => {
      this.generatingDiagnostics = false;
    });
  }

  socket!: WebSocket;

  startLiveFeed(options: { logName: string; severityLevel: number }) {
    const { logName, severityLevel } = options;
    const token = cookie.get("token") || "null";
    let wsUrl;
    if (configLoader.config.servicesUrls.coriolisLogStreamBaseUrl === "") {
      wsUrl = `wss://${window.location.host}`;
    } else {
      wsUrl = configLoader.config.servicesUrls.coriolisLogStreamBaseUrl.replace(
        "https",
        "wss"
      );
    }

    let url = `${wsUrl}/log-stream?auth_type=keystone`;
    url += `&auth_token=${token}&severity=${severityLevel}`;

    if (logName !== "All Logs") {
      url += `&app_name=${logName}`;
    }

    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      console.log("WS Log connection open");
    };
    this.socket.onmessage = e => {
      if (typeof e.data === "string") {
        this.addToLiveFeed(JSON.parse(e.data));
      }
    };
    this.socket.onclose = () => {
      console.log("WS Log connection closed");
    };
    this.socket.onerror = (e: any) => {
      notificationStore.alert(`WebSocket error: ${e.message}`, "error");
    };
  }

  @action addToLiveFeed(feed: { message: string }) {
    this.liveFeed = [...this.liveFeed, feed.message];
    if (this.liveFeed.length > MAX_STREAM_LINES) {
      this.liveFeed = [
        ...this.liveFeed.filter(
          (_, i) => i > this.liveFeed.length - MAX_STREAM_LINES
        ),
      ];
    }
  }

  @action clearLiveFeed() {
    this.liveFeed = [];
  }

  @action stopLiveFeed() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default new LogStore();
