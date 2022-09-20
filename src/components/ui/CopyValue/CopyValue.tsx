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

import CopyButton from "@src/components/ui/CopyButton";
import DomUtils from "@src/utils/DomUtils";
import notificationStore from "@src/stores/NotificationStore";

const Wrapper = styled.div<any>`
  cursor: pointer;
  display: flex;
  &:hover > span:last-child {
    opacity: 1;
  }
  ${props =>
    props.capitalize
      ? css`
          text-transform: capitalize;
        `
      : ""}
`;
const Value = styled.span<any>`
  width: ${(props: any) => `${props.width || "auto"}`};
  ${(props: any) => (props.maxWidth ? `max-width: ${props.maxWidth};` : "")}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  margin-right: 4px;
`;

type Props = {
  value: string;
  label?: string;
  width?: string;
  maxWidth?: string;
  capitalize?: boolean;
  onCopy?: (value: string) => void;
  style?: React.CSSProperties;
};
@observer
class CopyValue extends React.Component<Props> {
  handleCopyIdClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e && e.stopPropagation) e.stopPropagation();

    const succesful = DomUtils.copyTextToClipboard(this.props.value);
    if (this.props.onCopy) this.props.onCopy(this.props.value);

    if (succesful) {
      notificationStore.alert("The value has been copied to clipboard.");
    } else {
      notificationStore.alert("The value couldn't be copied", "error");
    }
  }

  render() {
    return (
      <Wrapper
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          this.handleCopyIdClick(e);
        }}
        onMouseDown={(e: { stopPropagation: () => void }) => {
          e.stopPropagation();
        }}
        onMouseUp={(e: { stopPropagation: () => void }) => {
          e.stopPropagation();
        }}
        capitalize={this.props.capitalize}
        style={this.props.style}
      >
        <Value width={this.props.width} maxWidth={this.props.maxWidth}>
          {this.props.label || this.props.value}
        </Value>
        <CopyButton />
      </Wrapper>
    );
  }
}

export default CopyValue;
