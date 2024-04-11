/*
Copyright (C) 2024 Cloudbase Solutions SRL
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

import WizardScripts from "@src/components/modules/WizardModule/WizardScripts";
import { fireEvent, render } from "@testing-library/react";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { REPLICA_ITEM_DETAILS_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import ReplicaDeploymentOptions from "./";

jest.mock("@src/plugins/default/ContentPlugin", () => jest.fn(() => null));
jest.mock("@src/components/modules/WizardModule/WizardScripts", () => ({
  __esModule: true,
  default: (props: WizardScripts["props"]) => (
    <div data-testid="ScriptsComponent">
      <div data-testid="ScriptsUploaded">
        {props.uploadedScripts.map(s => s.scriptContent).join(", ")}
      </div>
      <div
        data-testid="ScriptsRemove"
        onClick={() => {
          props.onScriptDataRemove(props.uploadedScripts[0]);
        }}
      />
      <div data-testid="ScriptsRemoved">
        {props.removedScripts.map(s => s.scriptContent).join(", ")}
      </div>
      <div
        data-testid="ScriptsCancel"
        onClick={() => {
          props.onCancelScript("windows", null);
          props.scrollableRef &&
            props.scrollableRef(null as any as HTMLElement);
        }}
      />
      <div
        data-testid="ScriptsUpload"
        onClick={() => {
          props.onScriptUpload({
            scriptContent: `script-content-${Math.random()}`,
            fileName: `script-name.ps1`,
            global: "windows",
          });
        }}
      />
    </div>
  ),
}));

describe("ReplicaDeploymentOptions", () => {
  let defaultProps: ReplicaDeploymentOptions["props"];

  beforeEach(() => {
    defaultProps = {
      instances: [INSTANCE_MOCK],
      transferItem: REPLICA_ITEM_DETAILS_MOCK,
      minionPools: [
        MINION_POOL_MOCK,
        { ...MINION_POOL_MOCK, id: "pool2", name: "Pool2" },
      ],
      loadingInstances: false,
      onCancelClick: jest.fn(),
      onDeployClick: jest.fn(),
      onResizeUpdate: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ReplicaDeploymentOptions {...defaultProps} />);
    expect(getByText("Deploy")).toBeTruthy();
  });

  it("executes on Enter", () => {
    render(<ReplicaDeploymentOptions {...defaultProps} />);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(defaultProps.onDeployClick).toHaveBeenCalled();
  });

  it("calls onResizeUpdate on selectedBarButton state change", () => {
    render(<ReplicaDeploymentOptions {...defaultProps} />);
    fireEvent.click(TestUtils.selectAll("ToggleButtonBar__Item-")[1]);
    expect(defaultProps.onResizeUpdate).toHaveBeenCalled();
  });

  it("handles value change", () => {
    render(<ReplicaDeploymentOptions {...defaultProps} />);
    expect(TestUtils.select("Switch__Wrapper")?.textContent).toBe("Yes");
    fireEvent.click(TestUtils.select("Switch__InputWrapper")!);
    expect(TestUtils.select("Switch__Wrapper")?.textContent).toBe("No");
  });

  it("handles script operations", () => {
    const { getByTestId } = render(
      <ReplicaDeploymentOptions {...defaultProps} />
    );
    fireEvent.click(TestUtils.selectAll("ToggleButtonBar__Item-")[1]);
    fireEvent.click(getByTestId("ScriptsUpload"));
    expect(getByTestId("ScriptsUploaded").textContent).toContain(
      "script-content"
    );
    fireEvent.click(getByTestId("ScriptsCancel"));
    expect(getByTestId("ScriptsUploaded").textContent).toBe("");

    fireEvent.click(getByTestId("ScriptsUpload"));
    expect(getByTestId("ScriptsUploaded").textContent).toContain(
      "script-content"
    );
    expect(getByTestId("ScriptsRemoved").textContent).toBe("");
    fireEvent.click(getByTestId("ScriptsRemove"));
    expect(getByTestId("ScriptsRemoved").textContent).toContain(
      "script-content"
    );
  });

  it("doesn't render minion pool mappings", () => {
    const { rerender } = render(<ReplicaDeploymentOptions {...defaultProps} />);
    expect(document.body.textContent).toContain("Minion Pool Mappings");

    rerender(<ReplicaDeploymentOptions {...defaultProps} minionPools={[]} />);
    expect(document.body.textContent).not.toContain("Minion Pool Mappings");
  });

  it("changes minion pool mappings value", () => {
    render(<ReplicaDeploymentOptions {...defaultProps} />);
    fireEvent.click(TestUtils.select("DropdownButton__Wrapper-")!);
    const dropdownItem = TestUtils.selectAll("Dropdown__ListItem-")[2];
    expect(dropdownItem.textContent).toBe("Pool2");
    fireEvent.click(dropdownItem);
    expect(TestUtils.select("DropdownButton__Label-")?.textContent).toBe(
      "Pool2"
    );
  });

  it("handles migrate click", () => {
    const { getByText } = render(<ReplicaDeploymentOptions {...defaultProps} />);
    fireEvent.click(getByText("Deploy"));
    expect(defaultProps.onDeployClick).toHaveBeenCalled();
  });
});
