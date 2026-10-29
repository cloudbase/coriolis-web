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

export const DEFAULT_FETCH_BATCH_SIZE = 100;
export const DEFAULT_MAX_FETCH_BATCHES = 100;

export type PaginatedPageParams = {
  limit: number;
  marker: string | null;
  batchIndex: number;
};

export type FetchAllPagesOptions = {
  batchSize?: number;
  maxBatches?: number;
};

/**
 * Collects a whole list by walking the API's marker pagination (`marker` is
 * the previous batch's last id). The API returns no total count or next
 * link, so a short batch is the only end-of-list signal.
 *
 * De-duplicates by id, since a record can shift between batches when the
 * list changes while it is being walked. Rejects if a batch fails, or if the
 * list is longer than `maxBatches` batches, so a caller never stores a
 * half-fetched or a truncated list.
 */
export async function fetchAllPages<T extends { id: string }>(
  fetchPage: (params: PaginatedPageParams) => Promise<T[]>,
  options?: FetchAllPagesOptions,
): Promise<T[]> {
  const batchSize = options?.batchSize || DEFAULT_FETCH_BATCH_SIZE;
  const maxBatches = options?.maxBatches || DEFAULT_MAX_FETCH_BATCHES;

  const items: T[] = [];
  const seenIds = new Set<string>();
  let marker: string | null = null;

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const results = await fetchPage({
      limit: batchSize,
      marker,
      batchIndex: batch,
    });

    results.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        items.push(item);
      }
    });

    if (results.length < batchSize) {
      return items;
    }

    const nextMarker = results[results.length - 1].id;
    if (nextMarker === marker) {
      return items;
    }
    marker = nextMarker;
  }

  // Returning the records collected so far would hand back a truncated list
  // that a caller cannot tell apart from a complete one, and the stores would
  // commit it as the whole dataset. Fail the way a failed batch does.
  throw new Error(
    `Stopped collecting paginated results after ${maxBatches} requests of ` +
      `${batchSize} records. The list is longer than this helper collects; ` +
      `raise the fetch batch size.`,
  );
}
