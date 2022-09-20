/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import styled, { css } from "styled-components";

import errorIcon from "./resources/error.svg";

const Wrapper = styled.div<{ showBackground?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 16px;
  ${props =>
    props.showBackground
      ? css`
          background: rgba(255, 0, 0, 0.1);
        `
      : ""}
  border-radius: 4px;
  padding: 8px;
`;
const ServerErrorIcon = styled.div`
  width: 26px;
  height: 26px;
  margin-bottom: 4px;
  background-image: url("${errorIcon}");
`;
const ServerErrorText = styled.div`
  margin-top: 4px;
  text-align: center;
`;
type Props = {
  showBackground?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

@observer
class SetupPageServerError extends React.Component<Props> {
  render() {
    return (
      <Wrapper
        style={this.props.style}
        showBackground={this.props.showBackground}
      >
        <ServerErrorIcon />
        <ServerErrorText>{this.props.children}</ServerErrorText>
      </Wrapper>
    );
  }
}

export default SetupPageServerError;
