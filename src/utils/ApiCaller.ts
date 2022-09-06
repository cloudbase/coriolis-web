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

import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import cookie from "js-cookie";

import cacher from "./Cacher";
import logger from "./ApiLogger";
import ApiCallerHandlers from "./ApiCallerHandlers";

type Cancelable = {
  requestId: string;
  cancel: () => void;
};

export type RequestOptions = {
  url: string;
  method?: AxiosRequestConfig["method"];
  cancelId?: string;
  headers?: { [prop: string]: string };
  data?: any;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  quietError?: boolean | null;
  skipLog?: boolean | null;
  cache?: boolean | null;
  cacheFor?: number | null;
  timeout?: number;
};

let cancelables: Cancelable[] = [];
const CancelToken = axios.CancelToken;

const addCancelable = (cancelable: Cancelable) => {
  cancelables.unshift(cancelable);
  if (cancelables.length > 100) {
    cancelables.pop();
  }
};

class ApiCaller {
  constructor() {
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }

  get projectId(): string {
    return cookie.get("projectId") || "undefined";
  }

  removeFromCache(url: string) {
    cacher.remove(url);
  }

  cancelRequests(cancelRequestId: string) {
    const filteredCancelables = cancelables.filter(
      r => r.requestId === cancelRequestId
    );
    filteredCancelables.forEach(c => {
      c.cancel();
    });
    cancelables = cancelables.filter(r => r.requestId !== cancelRequestId);
  }

  get(url: string): Promise<any> {
    return this.send({ url });
  }

  async send(options: RequestOptions): Promise<AxiosResponse<any>> {
    const cachedData = options.cache
      ? cacher.load({ key: options.url, maxAge: options.cacheFor })
      : null;
    if (cachedData) {
      const response: any = { data: cachedData };
      return response;
    }

    const axiosOptions: AxiosRequestConfig = {
      url: options.url,
      method: options.method || "GET",
      headers: options.headers || {},
      data: options.data || null,
      responseType: options.responseType || "json",
      timeout: options.timeout,
    };

    if (options.cancelId) {
      let cancel = () => {};
      axiosOptions.cancelToken = new CancelToken(c => {
        cancel = c;
      });
      addCancelable({ requestId: options.cancelId, cancel });
    }

    if (!options.skipLog) {
      logger.log({
        url: axiosOptions.url,
        method: axiosOptions.method || "GET",
        type: "REQUEST",
      });
    }

    const apiCallerHandlers = new ApiCallerHandlers(options, axiosOptions);

    try {
      const response = await axios(axiosOptions);
      if (!options.skipLog) {
        console.log(
          `%cResponse ${axiosOptions.url}`,
          "color: #0044CA",
          response.data
        );
        logger.log({
          url: axiosOptions.url,
          method: axiosOptions.method || "GET",
          type: "RESPONSE",
          requestStatus: 200,
        });
      }
      if (options.cache) {
        cacher.save({ key: options.url, data: response.data });
      }
      return response;
    } catch (err) {
      const error: any = err;
      if (error.response) {
        throw apiCallerHandlers.handleErrorResponse(error);
      } else if (error.request) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw apiCallerHandlers.handleErrorRequest(error);
      } else {
        throw apiCallerHandlers.handleRequestCancel(error);
      }
    }
  }

  setDefaultHeader(name: string, value: string | null) {
    axios.defaults.headers.common[name] = value;
  }
}

export default new ApiCaller();
