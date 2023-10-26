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

import { render } from "@testing-library/react";

import MigrationDetailsContent from ".";
import { MIGRATION_ITEM_DETAILS_MOCK } from "@tests/mocks/TransferMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { NETWORK_MOCK } from "@tests/mocks/NetworksMock";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => <div>{props.endpoint}</div>,
}));
jest.mock("react-router-dom", () => ({ Link: "a" }));

describe("MigrationDetailsContent", () => {
  let defaultProps: MigrationDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      item: MIGRATION_ITEM_DETAILS_MOCK,
      itemId: MIGRATION_ITEM_DETAILS_MOCK.id,
      minionPools: [MINION_POOL_MOCK],
      detailsLoading: false,
      storageBackends: [STORAGE_BACKEND_MOCK],
      instancesDetails: [INSTANCE_MOCK],
      instancesDetailsLoading: false,
      networks: [NETWORK_MOCK],
      sourceSchema: [],
      sourceSchemaLoading: false,
      destinationSchema: [],
      destinationSchemaLoading: false,
      endpoints: [OPENSTACK_ENDPOINT_MOCK, VMWARE_ENDPOINT_MOCK],
      page: "",
      onDeleteMigrationClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<MigrationDetailsContent {...defaultProps} />);
    expect(getByText(MIGRATION_ITEM_DETAILS_MOCK.id)).toBeTruthy();
  });

  it("renders tasks page", () => {
    const { getByText } = render(
      <MigrationDetailsContent {...defaultProps} page="tasks" />
    );
    expect(
      getByText(
        MIGRATION_ITEM_DETAILS_MOCK.tasks[0].task_type.replace("_", " ")
      )
    ).toBeTruthy();
  });
});
