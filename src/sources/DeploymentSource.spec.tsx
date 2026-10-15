/*
Copyright (C) 2026  Cloudbase Solutions SRL
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
import DeploymentSource from "./DeploymentSource";

jest.mock("@src/utils/ApiCaller", () => ({
  __esModule: true,
  default: { send: jest.fn(), projectId: "project-1" },
}));
jest.mock("@src/utils/Config", () => ({
  __esModule: true,
  default: {
    config: {
      fullListFetchBatchSize: 50,
      servicesUrls: { coriolis: "http://invalid.it/" },
    },
  },
}));

const send = Api.send as jest.Mock;

const page = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}` }));

const urlsOf = () => send.mock.calls.map(c => c[0].url as string);

const limitsOf = () =>
  urlsOf().map(url => new URL(url).searchParams.get("limit"));

describe("DeploymentSource.getAllDeployments", () => {
  beforeEach(() => {
    send.mockReset();
  });

  it("combines every batch into one list", async () => {
    send
      .mockResolvedValueOnce({ data: { deployments: page(50, "a") } })
      .mockResolvedValueOnce({ data: { deployments: page(50, "b") } })
      .mockResolvedValueOnce({ data: { deployments: page(12, "c") } });

    const result = await DeploymentSource.getAllDeployments();

    expect(result).toHaveLength(112);
    expect(result[0].id).toBe("a-0");
    expect(result[111].id).toBe("c-11");
  });

  it("requests the configured batch size on every call", async () => {
    send
      .mockResolvedValueOnce({ data: { deployments: page(50, "a") } })
      .mockResolvedValueOnce({ data: { deployments: page(3, "b") } });

    await DeploymentSource.getAllDeployments();

    expect(limitsOf()).toEqual(["50", "50"]);
  });

  it("ignores any UI page size: the batch size comes from the config", async () => {
    send.mockResolvedValue({ data: { deployments: page(2, "a") } });

    await DeploymentSource.getAllDeployments();

    expect(limitsOf()).toEqual(["50"]);
    expect(urlsOf()[0]).not.toContain("limit=25");
  });

  it("pages with a marker taken from the previous batch", async () => {
    send
      .mockResolvedValueOnce({ data: { deployments: page(50, "a") } })
      .mockResolvedValueOnce({ data: { deployments: page(1, "b") } });

    await DeploymentSource.getAllDeployments();

    const urls = urlsOf();
    expect(urls[0]).not.toContain("marker=");
    expect(urls[1]).toContain("marker=a-49");
  });

  it("stops after a short batch", async () => {
    send.mockResolvedValueOnce({ data: { deployments: page(4, "a") } });

    const result = await DeploymentSource.getAllDeployments();

    expect(result).toHaveLength(4);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list when the project has no deployments", async () => {
    send.mockResolvedValueOnce({ data: { deployments: [] } });

    const result = await DeploymentSource.getAllDeployments();

    expect(result).toEqual([]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("only lets the first request raise an error alert", async () => {
    send
      .mockResolvedValueOnce({ data: { deployments: page(50, "a") } })
      .mockResolvedValueOnce({ data: { deployments: page(0, "b") } });

    await DeploymentSource.getAllDeployments();

    expect(send.mock.calls[0][0].quietError).toBeFalsy();
    expect(send.mock.calls[1][0].quietError).toBe(true);
  });

  it("rejects when a batch fails, rather than returning a partial list", async () => {
    send
      .mockResolvedValueOnce({ data: { deployments: page(50, "a") } })
      .mockRejectedValueOnce(new Error("boom"));

    await expect(DeploymentSource.getAllDeployments()).rejects.toThrow("boom");
  });
});
