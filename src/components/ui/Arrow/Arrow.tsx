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

import arrowImage from "./images/arrow";
import arrowThickImage from "./images/arrow-thick";

const getOrientation = (props: any) => `
  ${props.orientation === "left" ? "transform: rotate(180deg);" : ""}
  ${props.orientation === "up" ? "transform: rotate(-90deg);" : ""}
  ${props.orientation === "down" ? "transform: rotate(90deg);" : ""}
`;

const Wrapper = styled.div<any>`
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props =>
    props.useDefaultCursor || props.disabled ? "default" : "pointer"};
  opacity: ${props => props.opacity};
  transition: all ${ThemeProps.animations.swift};
  ${props => getOrientation(props)}
`;

type Props = {
  primary?: boolean;
  useDefaultCursor?: boolean;
  orientation: "left" | "down" | "up" | "right";
  opacity: number;
  disabled?: boolean;
  color?: string;
  thick?: boolean;
  style?: React.CSSProperties;
};

@observer
class Arrow extends React.Component<Props> {
  static defaultProps: Props = {
    orientation: "right",
    opacity: 1,
  };

  render() {
    let color = this.props.primary
      ? ThemePalette.primary
      : ThemePalette.grayscale[4];
    color = this.props.color || color;
    color = this.props.disabled ? ThemePalette.grayscale[0] : color;
    return (
      <Wrapper
        {...this.props}
        dangerouslySetInnerHTML={{
          __html: this.props.thick ? arrowThickImage(color) : arrowImage(color),
        }}
      />
    );
  }
}

export default Arrow;
