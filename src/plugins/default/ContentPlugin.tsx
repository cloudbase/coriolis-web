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

import * as React from "react";
import styled from "styled-components";

import configLoader from "@src/utils/Config";
import LabelDictionary from "@src/utils/LabelDictionary";

import FieldInput from "@src/components/ui/FieldInput";
import type { Field } from "@src/@types/Field";

import { Endpoint, Validation } from "@src/@types/Endpoint";
import { ThemeProps } from "@src/components/Theme";

export const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
export const Fields = styled.div<any>`
  display: flex;
  margin-top: 32px;
  padding: 0 32px;
  flex-direction: column;
  overflow: auto;
`;
export const FieldStyled = styled(FieldInput)`
  min-width: ${props => (props.useTextArea ? "100%" : "224px")};
  max-width: ${ThemeProps.inputSizes.large.width}px;
  margin-bottom: 16px;
`;
export const Row = styled.div<any>`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`;

type Props = {
  connectionInfoSchema: Field[];
  validation: Validation | null;
  invalidFields: string[];
  getFieldValue: (field: Field | null) => any;
  handleFieldChange: (field: Field | null, value: any) => void;
  disabled: boolean;
  cancelButtonText: string;
  validating: boolean;
  onRef: (contentPlugin: any) => void;
  handleFieldsChange: (items: { field: Field; value: any }[]) => void;
  originalConnectionInfo: Endpoint["connection_info"];
  onResizeUpdate: (scrollOffset: number) => void;
  scrollableRef: (ref: HTMLElement) => void;
  highlightRequired: () => void;
  handleValidateClick: () => void;
  handleCancelClick: () => void;
};

export const findInvalidFields = (
  schema: Field[],
  getFieldValue: (field: Field | null) => any
) => {
  const invalidFields = schema
    .filter(field => {
      if (field.required) {
        const value = getFieldValue(field);
        return !value || value.length === 0;
      }
      return false;
    })
    .map(f => f.name);

  return invalidFields;
};

export const renderFields = (opts: {
  schema: Field[];
  disabled: boolean;
  invalidFields: string[];
  getFieldValue: (field: Field | null) => any;
  handleFieldChange: (field: Field | null, value: any) => void;
}) => {
  const { schema, disabled, invalidFields, getFieldValue, handleFieldChange } =
    opts;
  const rows: JSX.Element[] = [];
  let lastField: JSX.Element;
  let i = 0;
  schema.forEach((field, schemaIndex) => {
    const isPassword =
      Boolean(
        configLoader.config.passwordFields.find(fn => field.name === fn)
      ) || field.name.indexOf("password") > -1;
    const currentField = (
      <FieldStyled
        {...field}
        label={field.title || LabelDictionary.get(field.name)}
        width={ThemeProps.inputSizes.large.width}
        disabled={disabled}
        password={isPassword}
        highlight={invalidFields.findIndex(fn => fn === field.name) > -1}
        value={getFieldValue(field)}
        onChange={value => {
          handleFieldChange(field, value);
        }}
      />
    );
    const pushRow = (field1: React.ReactNode, field2?: React.ReactNode) => {
      rows.push(
        <Row key={field.name}>
          {field1}
          {field2}
        </Row>
      );
    };
    if (field.useTextArea) {
      pushRow(currentField);
      i -= 1;
    } else if (i % 2 !== 0) {
      pushRow(lastField, currentField);
    } else if (schemaIndex === schema.length - 1) {
      pushRow(currentField);
      if (field.useTextArea) {
        i -= 1;
      }
    } else {
      lastField = currentField;
    }
    i += 1;
  });

  return <Fields>{rows}</Fields>;
};

class ContentPlugin extends React.Component<Props> {
  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  findInvalidFields = () =>
    findInvalidFields(
      this.props.connectionInfoSchema,
      this.props.getFieldValue
    );

  renderFields() {
    return renderFields({
      schema: this.props.connectionInfoSchema,
      disabled: this.props.disabled,
      invalidFields: this.props.invalidFields,
      getFieldValue: this.props.getFieldValue,
      handleFieldChange: this.props.handleFieldChange,
    });
  }

  render() {
    return <Wrapper>{this.renderFields()}</Wrapper>;
  }
}

export default ContentPlugin;
