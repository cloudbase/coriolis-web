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
import { observer } from "mobx-react";
import styled, { css } from "styled-components";

import Switch from "@src/components/ui/Switch";
import TextInput from "@src/components/ui/TextInput";

import LabelDictionary from "@src/utils/LabelDictionary";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import AutocompleteDropdown from "@src/components/ui/Dropdowns/AutocompleteDropdown";
import { Field, EnumItem, isEnumSeparator } from "@src/@types/Field";

const Wrapper = styled.div<{
  width?: number;
  highlight?: boolean;
  disabled?: boolean;
  disabledLoading?: boolean;
}>`
  display: flex;
  ${props => (props.width ? `width: ${props.width - 2}px;` : "")}
  flex-direction: column;
  border: 1px solid
    ${props =>
      props.highlight ? ThemePalette.alert : ThemePalette.grayscale[2]};
  border-radius: ${ThemeProps.borderRadius};
  ${props =>
    props.disabled
      ? css`
          opacity: 0.5;
        `
      : ""}
  ${props =>
    props.disabledLoading ? ThemeProps.animations.disabledLoading : ""}
`;
const Column = styled.div<any>`
  ${ThemeProps.exactWidth("calc(50% - 24px)")}
  height: 32px;
  padding: 0 8px 0 16px;
  display: flex;
  align-items: center;
  > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  ${props =>
    props.header
      ? css`
          color: ${ThemePalette.grayscale[4]};
          background: ${ThemePalette.grayscale[7]};
        `
      : ""}
`;
const Row = styled.div<any>`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${ThemePalette.grayscale[2]};
  &:last-child {
    border-bottom: 0;
  }
  &:first-child ${Column} {
    border-top-left-radius: ${ThemeProps.borderRadius};
  }
  &:last-child ${Column} {
    border-bottom-left-radius: ${ThemeProps.borderRadius};
  }
`;
type Props = {
  properties: Field[];
  highlight?: boolean;
  onChange: (property: Field, value: any) => void;
  valueCallback: (property: Field) => any;
  hideRequiredSymbol?: boolean;
  disabled?: boolean;
  disabledLoading?: boolean;
  labelRenderer?: ((propName: string) => string) | null;
  width?: number;
};
@observer
class PropertiesTable extends React.Component<Props> {
  getName(propName: string): string {
    if (this.props.labelRenderer) {
      return this.props.labelRenderer(propName);
    }

    if (propName.indexOf("/") > -1) {
      return LabelDictionary.get(
        propName.substr(propName.lastIndexOf("/") + 1)
      );
    }
    return LabelDictionary.get(propName);
  }

  renderSwitch(prop: Field, opts: { triState: boolean }) {
    return (
      <Switch
        secondary
        disabled={this.props.disabledLoading}
        triState={opts.triState}
        height={16}
        checked={this.props.valueCallback(prop)}
        onChange={checked => {
          this.props.onChange(prop, checked);
        }}
      />
    );
  }

  renderTextInput(prop: Field) {
    return (
      <TextInput
        width="100%"
        embedded
        type={prop.password ? "password" : "text"}
        value={this.props.valueCallback(prop)}
        onChange={e => {
          this.props.onChange(prop, e.target.value);
        }}
        placeholder={this.getName(prop.name)}
        required={
          typeof prop.required === "boolean" && !this.props.hideRequiredSymbol
            ? prop.required
            : false
        }
        disabled={this.props.disabledLoading}
      />
    );
  }

  renderEnumDropdown(prop: Field) {
    if (!prop.enum) {
      return null;
    }
    let items = prop.enum.map((e: EnumItem) => {
      if (typeof e === "string") {
        return {
          label: this.getName(e),
          value: e,
        };
      }
      if (isEnumSeparator(e)) {
        return { separator: true };
      }
      return {
        label: e.name,
        value: e.id,
      };
    });

    items = [{ label: "Choose a value", value: null }, ...items];

    const selectedItem = items.find(
      i => !i.separator && i.value === this.props.valueCallback(prop)
    );

    const commonProps = {
      embedded: true,
      width: 320,
      selectedItem,
      items,
      disabled: this.props.disabledLoading,
      onChange: (item: { value: any }) => this.props.onChange(prop, item.value),
      required:
        typeof prop.required === "boolean" && !this.props.hideRequiredSymbol
          ? prop.required
          : false,
    };
    if (items.length < 10) {
      return (
        <Dropdown
          noSelectionMessage="Choose a value"
          dimFirstItem
          {...commonProps}
        />
      );
    }
    return (
      <AutocompleteDropdown
        dimNullValue
        {...commonProps}
      />
    );
  }

  renderInput(prop: Field) {
    let input = null;
    switch (prop.type) {
      case "boolean":
        input = this.renderSwitch(prop, {
          triState: Boolean(prop.nullableBoolean),
        });
        break;
      case "string":
        if (prop.enum) {
          input = this.renderEnumDropdown(prop);
        } else {
          input = this.renderTextInput(prop);
        }
        break;
      default:
    }

    return input;
  }

  render() {
    const hasRequiredInputs = this.props.properties.some(
      prop => prop.required && prop.type === "string"
    );
    const width =
      this.props.width && hasRequiredInputs
        ? this.props.width - 20
        : this.props.width;
    return (
      <Wrapper
        disabled={this.props.disabled}
        disabledLoading={this.props.disabledLoading}
        width={width}
        highlight={this.props.highlight}
      >
        {this.props.properties.map(prop => (
          <Row key={prop.name}>
            <Column header>
              <span title={this.getName(prop.label || prop.name)}>
                {this.getName(prop.label || prop.name)}
              </span>
            </Column>
            <Column input>{this.renderInput(prop)}</Column>
          </Row>
        ))}
      </Wrapper>
    );
  }
}

export default PropertiesTable;
