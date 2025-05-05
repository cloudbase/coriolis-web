/*
Copyright (C) 2022  Cloudbase Solutions SRL
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

import type { Field } from "@src/@types/Field";

import { Endpoint, Validation } from "@src/@types/Endpoint";
import { ThemePalette } from "@src/components/Theme";
import { Link } from "react-router";
import {
  Wrapper,
  renderFields,
  findInvalidFields,
} from "../default/ContentPlugin";

const ServersInfo = styled.div`
  font-size: 12px;
  padding: 8px 32px 0;
`;
const LinkStyled = styled(Link)`
  color: ${ThemePalette.primary};
  text-decoration: none;
`;
const LinkDiv = styled.span`
  color: ${ThemePalette.primary};
  cursor: pointer;
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
      this.props.getFieldValue,
    );

  renderFields() {
    return renderFields({
      schema: this.props.connectionInfoSchema,
      getFieldValue: this.props.getFieldValue,
      handleFieldChange: this.props.handleFieldChange,
      disabled: this.props.disabled,
      invalidFields: this.props.invalidFields,
    });
  }

  render() {
    const link =
      window.location.pathname === "/bare-metal-servers" ? (
        <LinkDiv onClick={() => window.location.reload()}>
          hub servers page
        </LinkDiv>
      ) : (
        <LinkStyled to="/bare-metal-servers">hub servers page</LinkStyled>
      );
    return (
      <Wrapper>
        <ServersInfo>
          To add a server to an existing hub, use the {link}.
        </ServersInfo>
        {this.renderFields()}
      </Wrapper>
    );
  }
}

export default ContentPlugin;
