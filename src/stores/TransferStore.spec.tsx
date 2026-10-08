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

import TransferSource from "@src/sources/TransferSource";
import transferStore from "./TransferStore";

import type { TransferItem } from "@src/@types/MainItem";

jest.mock("@src/sources/TransferSource", () => ({
  __esModule: true,
  default: { getAllTransfers: jest.fn() },
}));
jest.mock("@src/utils/ApiCaller", () => ({
  __esModule: true,
  default: { cancelRequests: jest.fn() },
}));
jest.mock("./NotificationStore", () => ({
  __esModule: true,
  default: { alert: jest.fn() },
}));

const getAllTransfers = TransferSource.getAllTransfers as jest.Mock;

const transfers = (count: number): TransferItem[] =>
  Array.from({ length: count }, (_, i) => ({ id: `t-${i}` }) as TransferItem);

const deferred = () => {
  let resolve: (value: TransferItem[]) => void = () => {};
  const promise = new Promise<TransferItem[]>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("TransferStore.getTransfers", () => {
  beforeEach(() => {
    getAllTransfers.mockReset();
    transferStore.transfers = [];
    transferStore.loading = false;
    transferStore.transfersLoaded = false;
  });

  it("stores the complete list the source collected", async () => {
    const all = transfers(250);
    getAllTransfers.mockResolvedValue(all);

    await transferStore.getTransfers();

    expect(transferStore.transfers).toHaveLength(250);
    expect(transferStore.transfers).toEqual(all);
  });

  it("asks the source for the whole list, with no page or page size", async () => {
    getAllTransfers.mockResolvedValue(transfers(3));

    await transferStore.getTransfers({ skipLog: true });

    expect(getAllTransfers).toHaveBeenCalledTimes(1);
    const args = getAllTransfers.mock.calls[0][0];
    expect(args).not.toHaveProperty("limit");
    expect(args).not.toHaveProperty("marker");
    expect(args).not.toHaveProperty("page");
  });

  it("joins an in-flight collection instead of starting a second one", async () => {
    const { promise, resolve } = deferred();
    getAllTransfers.mockReturnValue(promise);

    const first = transferStore.getTransfers();
    const second = transferStore.getTransfers();
    const third = transferStore.getTransfers();

    resolve(transfers(5));
    await Promise.all([first, second, third]);

    expect(getAllTransfers).toHaveBeenCalledTimes(1);
    expect(transferStore.transfers).toHaveLength(5);
  });

  it("does not duplicate records when polls overlap", async () => {
    const { promise, resolve } = deferred();
    getAllTransfers.mockReturnValue(promise);

    const polls = [transferStore.getTransfers(), transferStore.getTransfers()];
    resolve(transfers(3));
    await Promise.all(polls);

    expect(transferStore.transfers.map(t => t.id)).toEqual([
      "t-0",
      "t-1",
      "t-2",
    ]);
  });

  it("starts a fresh collection once the previous one finished", async () => {
    getAllTransfers.mockResolvedValue(transfers(2));

    await transferStore.getTransfers();
    await transferStore.getTransfers();

    expect(getAllTransfers).toHaveBeenCalledTimes(2);
  });

  it("keeps the previously stored list when a collection fails", async () => {
    getAllTransfers.mockResolvedValueOnce(transfers(4));
    await transferStore.getTransfers();

    getAllTransfers.mockRejectedValueOnce(new Error("boom"));
    await expect(transferStore.getTransfers()).rejects.toThrow("boom");

    expect(transferStore.transfers).toHaveLength(4);
    expect(transferStore.loading).toBe(false);
  });

  it("releases the in-flight guard after a failure", async () => {
    getAllTransfers.mockRejectedValueOnce(new Error("boom"));
    await expect(transferStore.getTransfers()).rejects.toThrow("boom");

    getAllTransfers.mockResolvedValueOnce(transfers(1));
    await transferStore.getTransfers();

    expect(transferStore.transfers).toHaveLength(1);
  });
});
