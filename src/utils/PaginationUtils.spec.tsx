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

import { fetchAllPages, PaginatedPageParams } from "./PaginationUtils";

type Record = { id: string };

const records = (count: number, prefix = "r"): Record[] =>
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}` }));

const fakeApi = (all: Record[]) => {
  const calls: PaginatedPageParams[] = [];
  const fetchPage = (params: PaginatedPageParams) => {
    calls.push(params);
    const start = params.marker
      ? all.findIndex(r => r.id === params.marker) + 1
      : 0;
    return Promise.resolve(all.slice(start, start + params.limit));
  };
  return { calls, fetchPage };
};

describe("fetchAllPages", () => {
  it("combines the records of every batch, in order", async () => {
    const all = records(25);
    const { calls, fetchPage } = fakeApi(all);

    const result = await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(result).toEqual(all);
    expect(calls).toHaveLength(3);
  });

  it("walks the list by passing the previous batch's last id as marker", async () => {
    const all = records(25);
    const { calls, fetchPage } = fakeApi(all);

    await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(calls.map(c => c.marker)).toEqual([null, "r-9", "r-19"]);
    expect(calls.map(c => c.batchIndex)).toEqual([0, 1, 2]);
  });

  it("always requests the given batch size, whatever the UI shows per page", async () => {
    const { calls, fetchPage } = fakeApi(records(25));

    await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(calls.every(c => c.limit === 10)).toBe(true);
  });

  it("returns an empty list and stops after one request when there are no records", async () => {
    const { calls, fetchPage } = fakeApi([]);

    const result = await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(result).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  it("stops after one request when there are fewer records than a batch", async () => {
    const all = records(4);
    const { calls, fetchPage } = fakeApi(all);

    const result = await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(result).toEqual(all);
    expect(calls).toHaveLength(1);
  });

  it("makes a second, empty request when the total is exactly one full batch", async () => {
    const all = records(10);
    const { calls, fetchPage } = fakeApi(all);

    const result = await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(result).toEqual(all);
    expect(calls).toHaveLength(2);
  });

  it("stops correctly when the total is an exact multiple of the batch size", async () => {
    const all = records(30);
    const { calls, fetchPage } = fakeApi(all);

    const result = await fetchAllPages(fetchPage, { batchSize: 10 });

    expect(result).toEqual(all);
    expect(calls).toHaveLength(4);
  });

  it("de-duplicates records that shift between batches while collecting", async () => {
    // `r-9` is served again in the second batch, as happens when a list
    // sorted on a mutable key is reordered mid-collection.
    const pages = [
      [{ id: "r-8" }, { id: "r-9" }],
      [{ id: "r-9" }, { id: "r-10" }],
      [{ id: "r-11" }],
    ];
    let call = 0;
    const fetchPage = () => Promise.resolve(pages[call++]);

    const result = await fetchAllPages(fetchPage, { batchSize: 2 });

    expect(result.map(r => r.id)).toEqual(["r-8", "r-9", "r-10", "r-11"]);
  });

  it("stops when a batch repeats the marker it was given", async () => {
    const batch = [{ id: "a" }, { id: "b" }];
    const fetchPage = jest.fn().mockResolvedValue(batch);

    const result = await fetchAllPages(fetchPage, { batchSize: 2 });

    expect(result).toEqual(batch);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("gives up after the maximum number of batches", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    let next = 0;
    const fetchPage = ({ limit }: PaginatedPageParams) =>
      Promise.resolve(records(limit, `b${next++}`));

    const result = await fetchAllPages(fetchPage, {
      batchSize: 2,
      maxBatches: 3,
    });

    expect(result).toHaveLength(6);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("rejects when a batch fails, rather than returning a partial list", async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(records(2))
      .mockRejectedValueOnce(new Error("boom"));

    await expect(fetchAllPages(fetchPage, { batchSize: 2 })).rejects.toThrow(
      "boom",
    );
  });
});
