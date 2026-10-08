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
import TransferSource from "./TransferSource";

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

describe("TransferSource.getAllTransfers", () => {
  beforeEach(() => {
    send.mockReset();
  });

  it("combines every batch into one list", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockResolvedValueOnce({ data: { transfers: page(50, "b") } })
      .mockResolvedValueOnce({ data: { transfers: page(12, "c") } });

    const result = await TransferSource.getAllTransfers();

    expect(result).toHaveLength(112);
    expect(result.map(t => t.id)).toEqual(
      expect.arrayContaining(["a-0", "a-49", "b-0", "b-49", "c-0", "c-11"]),
    );
  });

  it("requests the configured batch size on every call", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockResolvedValueOnce({ data: { transfers: page(50, "b") } })
      .mockResolvedValueOnce({ data: { transfers: page(7, "c") } });

    const result = await TransferSource.getAllTransfers();

    expect(result).toHaveLength(107);
    expect(limitsOf()).toEqual(["50", "50", "50"]);
  });

  it("ignores any UI page size: the batch size comes from the config", async () => {
    send.mockResolvedValue({ data: { transfers: page(2, "a") } });

    await TransferSource.getAllTransfers();

    expect(limitsOf()).toEqual(["50"]);
    expect(urlsOf()[0]).not.toContain("limit=25");
  });

  it("pages with a marker taken from the previous batch", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockResolvedValueOnce({ data: { transfers: page(1, "b") } });

    await TransferSource.getAllTransfers();

    const urls = urlsOf();
    expect(urls[0]).not.toContain("marker=");
    expect(urls[1]).toContain("marker=a-49");
  });

  it("only lets the first request raise an error alert", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockResolvedValueOnce({ data: { transfers: page(0, "b") } });

    await TransferSource.getAllTransfers();

    expect(send.mock.calls[0][0].quietError).toBeFalsy();
    expect(send.mock.calls[1][0].quietError).toBe(true);
  });

  it("stops after a short batch", async () => {
    send.mockResolvedValueOnce({ data: { transfers: page(4, "a") } });

    const result = await TransferSource.getAllTransfers();

    expect(result).toHaveLength(4);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list when the project has no transfers", async () => {
    send.mockResolvedValueOnce({ data: { transfers: [] } });

    const result = await TransferSource.getAllTransfers();

    expect(result).toEqual([]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects when a batch fails, rather than returning a partial list", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockRejectedValueOnce(new Error("boom"));

    await expect(TransferSource.getAllTransfers()).rejects.toThrow("boom");
  });

  it("walks the list sorted on created_at", async () => {
    send
      .mockResolvedValueOnce({ data: { transfers: page(50, "a") } })
      .mockResolvedValueOnce({ data: { transfers: page(1, "b") } });

    await TransferSource.getAllTransfers();

    urlsOf().forEach(url => {
      const params = new URL(url).searchParams;
      expect(params.get("sort_key")).toBe("created_at");
      expect(params.get("sort_dir")).toBe("desc");
    });
  });

  it("returns the list in the order it was shown before: updated_at desc, never updated last", async () => {
    const transfers = [
      { id: "t-4", created_at: "2026-10-04", updated_at: null },
      { id: "t-3", created_at: "2026-10-03", updated_at: "2026-10-05" },
      { id: "t-2", created_at: "2026-10-02", updated_at: "2026-10-06" },
      { id: "t-1", created_at: "2026-10-01", updated_at: null },
    ];
    send.mockResolvedValueOnce({ data: { transfers } });

    const result = await TransferSource.getAllTransfers();

    expect(result.map(t => t.id)).toEqual(["t-2", "t-3", "t-4", "t-1"]);
  });
});
