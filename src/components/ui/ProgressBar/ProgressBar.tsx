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
import styled from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;
const ProgressLabel = styled.div`
  text-align: right;
  min-width: 36px;
  font-size: 12px;
`;
const ProgressBarWrapper = styled.div`
  background: white;
  flex-grow: 1;
`;
const Progress = styled.div<{ width: number }>`
  height: 2px;
  background: ${ThemePalette.primary};
  transition: all ${ThemeProps.animations.swift};
  width: ${props => props.width}%;
`;
type Props = {
  progress: number;
  style?: React.CSSProperties;
  useLabel?: boolean;
};
@observer
class ProgressBar extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <ProgressBarWrapper style={this.props.style}>
          <Progress width={this.props.progress} />
        </ProgressBarWrapper>
        {this.props.useLabel ? (
          <ProgressLabel>{this.props.progress} %</ProgressLabel>
        ) : null}
      </Wrapper>
    );
  }
}

export default ProgressBar;
