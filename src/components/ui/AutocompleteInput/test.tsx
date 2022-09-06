/*
Copyright (C) 2017  Cloudbase Solutions SRL
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
import sinon from "sinon";
import { shallow } from "enzyme";
import TW from "@src/utils/TestWrapper";
import AutocompleteInput from ".";

type Props = {
  value: string;
  customRef?: (ref: HTMLElement) => void;
  ref?: (ref: HTMLElement) => void;
  onChange: (value: string) => void;
  onClick?: () => void;
  disabled?: boolean;
  width?: number;
  large?: boolean;
  onFocus?: () => void;
  highlight?: boolean;
};

const wrap = (props: Props) =>
  new TW(
    shallow(
      // eslint-disable-next-line react/jsx-props-no-spreading
      <AutocompleteInput {...props} />
    ),
    "acInput"
  );

describe("AutocompleteInput Component", () => {
  it("renders input with correct data", () => {
    const wrapper = wrap({
      value: "value",
      onChange: () => {},
    });

    expect(wrapper.find("text").prop("embedded")).toBe(true);
    expect(wrapper.find("text").prop("value")).toBe("value");
  });

  it("dispatches click", () => {
    const onClick = sinon.spy();
    const wrapper = wrap({
      value: "value",
      onChange: () => {},
      onClick,
    });
    wrapper.find("arrow").click();
    expect(onClick.calledOnce).toBe(true);
  });
});
