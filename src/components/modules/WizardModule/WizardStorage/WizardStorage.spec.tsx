/*
Copyright (C) 2023  Cloudbase Solutions SRL
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

import React from "react";

import { InstanceUtils } from "@src/@types/Instance";
import { render } from "@testing-library/react";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";
import TestUtils from "@tests/TestUtils";

import WizardStorage from "./";

import type { Disk, Instance } from "@src/@types/Instance";

const CONNECTED_TO = `Connected to ${
  INSTANCE_MOCK.name
} (${InstanceUtils.shortenId(INSTANCE_MOCK.instance_name!)})`;

const diskMock = (over: Partial<Disk>): Disk => ({
  id: "disk-id",
  storage_backend_identifier: "disk-storage-backend-identifier",
  ...over,
});

const instanceWith = (disks: Disk[]): Instance => ({
  ...INSTANCE_MOCK,
  devices: { ...INSTANCE_MOCK.devices, disks },
});

const subtitles = () =>
  Array.from(TestUtils.selectAll("WizardStorage__StorageSubtitle")).map(
    subtitle => subtitle.textContent,
  );

describe("WizardStorage", () => {
  let defaultProps: WizardStorage["props"];

  beforeEach(() => {
    defaultProps = {
      storageBackends: [STORAGE_BACKEND_MOCK],
      loading: false,
      instancesDetails: [INSTANCE_MOCK],
      storageMap: null,
      defaultStorageLayout: "page",
      defaultStorage: { value: STORAGE_BACKEND_MOCK.id },
      onDefaultStorageChange: jest.fn(),
      onChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardStorage {...defaultProps} />);
    expect(getByText("Storage Backend Mapping")).toBeTruthy();
  });

  it("shows the disk name and size under the disk ID", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([
            diskMock({
              id: "disk-1",
              name: "Hard disk 1",
              size_bytes: 64424509440,
            }),
          ]),
        ]}
      />,
    );

    expect(getByText("disk-1")).toBeTruthy();
    // The details are only added to the disk mapping; a backend mapping row
    // can stand for several disks.
    expect(subtitles()).toEqual([
      CONNECTED_TO,
      "Hard disk 1 (60 GiB)",
      CONNECTED_TO,
    ]);
  });

  it("tells apart disks of the same size", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([
            diskMock({ id: "disk-1", name: "Hard disk 1", size_bytes: 1024 }),
            diskMock({ id: "disk-2", name: "Hard disk 2", size_bytes: 1024 }),
          ]),
        ]}
      />,
    );

    expect(getByText("Hard disk 1 (1 KiB)")).toBeTruthy();
    expect(getByText("Hard disk 2 (1 KiB)")).toBeTruthy();
  });

  it("shows the size alone when the disk has no name", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([diskMock({ id: "disk-1", size_bytes: 1073741824 })]),
        ]}
      />,
    );

    expect(getByText("1 GiB")).toBeTruthy();
  });

  it("shows the name alone when the disk has no size", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([diskMock({ id: "disk-1", name: "Hard disk 1" })]),
        ]}
      />,
    );

    expect(getByText("Hard disk 1")).toBeTruthy();
  });

  it("doesn't repeat a name which is the disk ID", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([
            diskMock({ id: "disk-1", name: "disk-1", size_bytes: 1024 }),
          ]),
        ]}
      />,
    );

    expect(getByText("1 KiB")).toBeTruthy();
  });

  it("shows the disk ID alone when there is no name or size", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[instanceWith([diskMock({ id: "disk-1" })])]}
      />,
    );

    expect(getByText("disk-1")).toBeTruthy();
    expect(subtitles()).toEqual([CONNECTED_TO, CONNECTED_TO]);
  });

  it("shortens a long disk name, keeping the full one as a tooltip", () => {
    const { getByText } = render(
      <WizardStorage
        {...defaultProps}
        instancesDetails={[
          instanceWith([
            diskMock({
              id: "disk-1",
              name: "my-very-long-disk-name",
              size_bytes: 1024,
            }),
          ]),
        ]}
      />,
    );

    expect(getByText("my-...-name (1 KiB)").getAttribute("title")).toBe(
      "my-very-long-disk-name",
    );
  });
});
