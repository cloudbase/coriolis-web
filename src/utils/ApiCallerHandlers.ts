import { AxiosRequestConfig } from "axios";
import notificationStore from "@src/stores/NotificationStore";
import { RequestOptions } from "./ApiCaller";
import logger from "./ApiLogger";

const isOnLoginPage = (): boolean =>
  window.location.pathname.indexOf("login") > -1;

const truncateUrl = (url: string): string => {
  const MAX_LENGTH = 100;
  let relativePath = url.replace(/http(s)?:\/\/.*?\//, "/");
  if (relativePath.length > MAX_LENGTH) {
    relativePath = `${relativePath.substring(0, MAX_LENGTH)}...`;
  }
  return relativePath;
};

const redirect = (statusCode: number) => {
  if (statusCode !== 401 || isOnLoginPage()) {
    return;
  }
  let currentPath = "?prev=/";
  if (window.location.pathname !== "/") {
    currentPath = `?prev=${window.location.pathname}${window.location.search}`;
  }
  window.location.href = `/login${currentPath}`;
};

class ApiCallerHandlers {
  setupOptions: RequestOptions;

  axiosOptions: AxiosRequestConfig;

  constructor(setupOptions: RequestOptions, axiosOptions: AxiosRequestConfig) {
    this.setupOptions = setupOptions;
    this.axiosOptions = axiosOptions;
  }

  handleErrorResponse(error: any) {
    if (
      (error.response.status !== 401 || !isOnLoginPage()) &&
      !this.setupOptions.quietError
    ) {
      const data = error.response.data;
      const message =
        (data && data.error && data.error.message) ||
        (data && data.description);
      const alertMessage =
        message ||
        `${error.response.statusText || error.response.status} ${truncateUrl(
          this.setupOptions.url
        )}`;
      const status =
        error.response.status && error.response.statusText
          ? `${error.response.status} - ${error.response.statusText}`
          : error.response.statusText || error.response.status;
      notificationStore.alert(alertMessage, "error", {
        action: {
          label: "View details",
          callback: () => ({
            request: this.axiosOptions,
            error: { status, message },
          }),
        },
      });
    }

    if (
      error.request.responseURL.indexOf("/proxy/azure/") === -1 &&
      error.request.responseURL.indexOf("/proxy/azure/login") === -1
    ) {
      redirect(error.response.status);
    }

    logger.log({
      url: this.axiosOptions.url,
      method: this.axiosOptions.method || "GET",
      type: "RESPONSE",
      requestStatus: error.response.status,
      requestError: error,
    });
    return error.response;
  }

  handleErrorRequest(error: any) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest
    if (!isOnLoginPage() && !this.setupOptions.quietError) {
      notificationStore.alert(
        `Request failed, there might be a problem with the connection to the server. ${truncateUrl(
          this.setupOptions.url
        )}`,
        "error",
        {
          action: {
            label: "View details",
            callback: () => ({
              request: this.axiosOptions,
              error: {
                message: "Request was made but no response was received",
              },
            }),
          },
        }
      );
    }
    logger.log({
      url: this.axiosOptions.url,
      method: this.axiosOptions.method || "GET",
      type: "RESPONSE",
      description: "No response",
      requestStatus: 500,
      requestError: error,
    });
    return {};
  }

  handleRequestCancel(error: any) {
    const canceled = error.__CANCEL__;
    if (canceled) {
      logger.log({
        url: this.axiosOptions.url,
        method: this.axiosOptions.method || "GET",
        type: "RESPONSE",
        requestStatus: "canceled",
      });
      return { canceled };
    }

    // Something happened in setting up the request that triggered an Error
    logger.log({
      url: this.axiosOptions.url,
      method: this.axiosOptions.method || "GET",
      type: "RESPONSE",
      description: "Something happened in setting up the request",
      requestStatus: 500,
    });
    notificationStore.alert(
      `Request failed, there might be a problem with the connection to the server. ${truncateUrl(
        this.setupOptions.url
      )}`,
      "error",
      {
        action: {
          label: "View details",
          callback: () => ({
            request: this.axiosOptions,
            error: { message: "Something happened in setting up the request" },
          }),
        },
      }
    );
    return error;
  }
}

export default ApiCallerHandlers;
