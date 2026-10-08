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

import DeploymentSource from "@src/sources/DeploymentSource";
import deploymentStore from "./DeploymentStore";

import type { DeploymentItem } from "@src/@types/MainItem";

jest.mock("@src/sources/DeploymentSource", () => ({
  __esModule: true,
  default: { getAllDeployments: jest.fn() },
}));
jest.mock("@src/utils/ApiCaller", () => ({
  __esModule: true,
  default: { cancelRequests: jest.fn() },
}));

const getAllDeployments = DeploymentSource.getAllDeployments as jest.Mock;

const deployments = (count: number): DeploymentItem[] =>
  Array.from({ length: count }, (_, i) => ({ id: `d-${i}` }) as DeploymentItem);

describe("DeploymentStore.getDeployments", () => {
  beforeEach(() => {
    getAllDeployments.mockReset();
    deploymentStore.deployments = [];
    deploymentStore.loading = false;
    deploymentStore.deploymentsLoaded = false;
  });

  it("stores the complete list the source collected", async () => {
    const all = deployments(180);
    getAllDeployments.mockResolvedValue(all);

    await deploymentStore.getDeployments();

    expect(deploymentStore.deployments).toHaveLength(180);
    expect(deploymentStore.deployments).toEqual(all);
  });

  it("asks the source for the whole list, with no page or page size", async () => {
    getAllDeployments.mockResolvedValue(deployments(3));

    await deploymentStore.getDeployments({ skipLog: true });

    const args = getAllDeployments.mock.calls[0][0];
    expect(args).not.toHaveProperty("limit");
    expect(args).not.toHaveProperty("marker");
    expect(args).not.toHaveProperty("page");
  });

  it("joins an in-flight collection instead of starting a second one", async () => {
    let resolve: (value: DeploymentItem[]) => void = () => {};
    getAllDeployments.mockReturnValue(
      new Promise<DeploymentItem[]>(r => {
        resolve = r;
      }),
    );

    const polls = [
      deploymentStore.getDeployments(),
      deploymentStore.getDeployments(),
    ];
    resolve(deployments(4));
    await Promise.all(polls);

    expect(getAllDeployments).toHaveBeenCalledTimes(1);
    expect(deploymentStore.deployments.map(d => d.id)).toEqual([
      "d-0",
      "d-1",
      "d-2",
      "d-3",
    ]);
  });

  it("clears loading and releases the guard after a failure", async () => {
    getAllDeployments.mockRejectedValueOnce(new Error("boom"));
    await expect(deploymentStore.getDeployments()).rejects.toThrow("boom");
    expect(deploymentStore.loading).toBe(false);

    getAllDeployments.mockResolvedValueOnce(deployments(1));
    await deploymentStore.getDeployments();

    expect(deploymentStore.deployments).toHaveLength(1);
  });
});
