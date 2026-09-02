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
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";

import WizardOptions, { findInvalidFields } from "./";

import type { Field } from "@src/@types/Field";

jest.mock("@src/plugins/default/ContentPlugin", () => jest.fn(() => null));
jest.mock("@src/utils/Config", () => ({
  config: {
    passwordFields: ["secret_key"],
  },
}));
jest.mock("react-transition-group", () => ({
  CSSTransition: (props: any) => <div>{props.children}</div>,
}));

describe("WizardOptions", () => {
  let defaultProps: WizardOptions["props"];

  beforeEach(() => {
    defaultProps = {
      fields: [{ name: "field1", label: "Field 1", type: "string" }],
      minionPools: [MINION_POOL_MOCK],
      hasStorageMap: false,
      wizardType: "replica",
      dictionaryKey: "replica",
      onChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardOptions {...defaultProps} />);
    expect(getByText("Target Minion Pool")).toBeTruthy();
  });
});

describe("WizardOptions.findInvalidFields", () => {
  const names = (data: any, schema: Field[]) =>
    findInvalidFields(data, schema).map(f => f.name);

  it("returns nothing for an empty schema", () => {
    expect(findInvalidFields({}, [])).toEqual([]);
  });

  it("ignores optional fields", () => {
    const schema: Field[] = [{ name: "description", type: "string" }];
    expect(names({}, schema)).toEqual([]);
  });

  it("reports a required field with neither a value nor a default", () => {
    const schema: Field[] = [
      { name: "migration_image", type: "string", required: true },
    ];
    expect(names({}, schema)).toEqual(["migration_image"]);
  });

  it("accepts a required field whose default is one of the available values", () => {
    const schema: Field[] = [
      {
        name: "migration_image",
        type: "string",
        required: true,
        enum: [{ id: "windows-image-id", name: "Windows" }],
        default: "windows-image-id",
      },
    ];
    expect(names({}, schema)).toEqual([]);
  });

  it("reports a required field whose default is no longer an available value", () => {
    const schema: Field[] = [
      {
        name: "migration_image",
        type: "string",
        required: true,
        enum: [{ id: "valid-image-id", name: "Windows Server" }],
        default: "deleted-image-id",
      },
    ];
    expect(names({}, schema)).toEqual(["migration_image"]);
  });

  it("reports a required field whose stale default was already discarded", () => {
    const schema: Field[] = [
      {
        name: "migration_image",
        type: "string",
        required: true,
        enum: [{ id: "valid-image-id", name: "Windows Server" }],
        default: null,
      },
    ];
    expect(names({}, schema)).toEqual(["migration_image"]);
  });

  it("ignores an optional field with a stale default", () => {
    const schema: Field[] = [
      {
        name: "migration_image",
        type: "string",
        enum: [{ id: "valid-image-id", name: "Windows Server" }],
        default: "deleted-image-id",
      },
    ];
    expect(names({}, schema)).toEqual([]);
  });

  it("uses the value from the data over the field default", () => {
    const schema: Field[] = [
      {
        name: "migration_image",
        type: "string",
        required: true,
        enum: [{ id: "valid-image-id", name: "Windows Server" }],
        default: "deleted-image-id",
      },
    ];
    expect(names({ migration_image: "valid-image-id" }, schema)).toEqual([]);
  });

  it("accepts a required boolean set to false", () => {
    const schema: Field[] = [
      { name: "list_all_networks", type: "boolean", required: true },
    ];
    expect(names({ list_all_networks: false }, schema)).toEqual([]);
  });

  it("accepts a required boolean whose default is false", () => {
    const schema: Field[] = [
      {
        name: "list_all_networks",
        type: "boolean",
        required: true,
        default: false,
      },
    ];
    expect(names({}, schema)).toEqual([]);
  });

  it("accepts a required integer set to 0", () => {
    const schema: Field[] = [
      { name: "disk_size", type: "integer", required: true },
    ];
    expect(names({ disk_size: 0 }, schema)).toEqual([]);
  });

  it("accepts a required integer whose default is 0 with an empty values list", () => {
    const schema: Field[] = [
      {
        name: "disk_size",
        type: "integer",
        required: true,
        enum: [],
        default: 0,
      },
    ];
    expect(names({}, schema)).toEqual([]);
  });

  it.each([
    ["an empty string", ""],
    ["null", null],
  ])("reports a required field set to %s", (_label, value) => {
    const schema: Field[] = [
      { name: "migration_image", type: "string", required: true },
    ];
    expect(names({ migration_image: value }, schema)).toEqual([
      "migration_image",
    ]);
  });

  it("reports a stale default on a required property of an object field", () => {
    const schema: Field[] = [
      {
        name: "migr_image_map",
        type: "object",
        properties: [
          {
            name: "linux",
            type: "string",
            required: true,
            enum: [{ id: "valid-image-id", name: "Ubuntu" }],
            default: "deleted-image-id",
          },
          {
            name: "windows",
            type: "string",
            enum: [{ id: "windows-image-id", name: "Windows" }],
            default: "windows-image-id",
          },
        ],
      },
    ];
    expect(names({}, schema)).toEqual(["linux"]);
  });

  it("accepts an object field property that has a value under its group", () => {
    const schema: Field[] = [
      {
        name: "migr_image_map",
        type: "object",
        properties: [
          {
            name: "linux",
            type: "string",
            required: true,
            enum: [{ id: "valid-image-id", name: "Ubuntu" }],
            default: "deleted-image-id",
          },
        ],
      },
    ];
    expect(
      names({ migr_image_map: { linux: "valid-image-id" } }, schema),
    ).toEqual([]);
  });

  it("validates the required properties of the selected sub field", () => {
    const schema: Field[] = [
      {
        name: "replica_export_mechanism",
        type: "string",
        enum: ["direct", "image"],
        subFields: [
          {
            name: "direct_options",
            properties: [{ name: "direct_volume", required: true }],
          },
          {
            name: "image_options",
            properties: [{ name: "export_image", required: true }],
          },
        ],
      },
    ];
    expect(names({ replica_export_mechanism: "image" }, schema)).toEqual([
      "export_image",
    ]);
  });
});
