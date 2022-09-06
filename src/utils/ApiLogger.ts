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

import DomUtils from "./DomUtils";

type LogType = "REQUEST" | "RESPONSE";

type LogOptions = {
  url?: string | null;
  method: string;
  type: LogType;
  description?: string;
  requestStatus?: number | "canceled";
  requestError?: any;
  windowPath?: string;
  stack?: string;
};

type RequestLog = LogOptions & {
  date: Date;
};

type Log = {
  requests: RequestLog[];
  userAgent: string;
  platform: string;
};

const MAX_LOGS = 1000;

const validateLog = (logs: RequestLog[]): boolean => {
  if (logs.length && !logs[0].windowPath) {
    return false;
  }
  return true;
};

class Storage {
  static NAME = "apiLog";

  static EMPTY = "[]";

  static getLogRaw(): string {
    return localStorage.getItem(this.NAME) || this.EMPTY;
  }

  static saveLog(options: LogOptions) {
    let logs: RequestLog[] = JSON.parse(
      localStorage.getItem(this.NAME) || this.EMPTY
    );
    if (!validateLog(logs)) {
      localStorage.setItem(this.NAME, this.EMPTY);
      logs = JSON.parse(this.EMPTY);
    }

    const newRequest: RequestLog = {
      date: new Date(),
      windowPath: window.location.href.replace(
        `${window.location.protocol}//${window.location.host}`,
        ""
      ),
      ...options,
    };

    if (options.type === "REQUEST") {
      const err = new Error();
      newRequest.stack = err.stack;
    }

    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    logs.push(newRequest);
    localStorage.setItem(this.NAME, JSON.stringify(logs));
  }
}

class ApiLogger {
  log(options: LogOptions) {
    if (options.type === "REQUEST") {
      console.log(
        `%cSending ${options.method} Request to ${options.url}`,
        "color: #F5A623"
      );
    } else if (options.requestError) {
      console.log(
        `%cError Response: ${options.url}`,
        "color: #D0021B",
        options.requestError
      );
    } else if (options.requestStatus === "canceled") {
      console.log(`%cRequest Canceled: ${options.url}`, "color: #0044CA");
    } else if (options.requestStatus === 500) {
      console.log(
        `%cError Something happened in setting up the request: ${options.url}`,
        "color: #D0021B"
      );
    }

    if (
      options.requestError &&
      options.requestError.response &&
      options.requestError.response.data
    ) {
      // eslint-disable-next-line no-param-reassign
      options.requestError = options.requestError.response.data.error;
    }

    Storage.saveLog(options);
  }

  download() {
    const requests: RequestLog[] = JSON.parse(Storage.getLogRaw());
    const log: Log = {
      requests,
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
    };

    DomUtils.download(JSON.stringify(log), "coriolis-log.json");
  }
}

export default new ApiLogger();
