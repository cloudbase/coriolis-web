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

import requiredImage from "./images/required.svg";

const Wrapper = styled.div<any>`
  position: relative;
  ${(props: any) =>
    props.disabledLoading ? ThemeProps.animations.disabledLoading : ""}
`;
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: -16px;
  top: 12px;
  background: url("${requiredImage}") center no-repeat;
`;

const getInputWidth = (props: any) => {
  if (props.width) {
    return props.width;
  }

  if (props.large) {
    return `${ThemeProps.inputSizes.large.width}px`;
  }

  return `${ThemeProps.inputSizes.regular.width}px`;
};

const Input = styled.textarea<any>`
  width: ${(props: any) => getInputWidth(props)};
  height: ${(props: any) =>
    props.height || `${ThemeProps.inputSizes.regular.height * 2}px`};
  border-radius: ${ThemeProps.borderRadius};
  background-color: #fff;
  border: 1px solid
    ${props =>
      props.highlight ? ThemePalette.alert : ThemePalette.grayscale[3]};
  color: ${ThemePalette.black};
  padding: 8px;
  font-size: inherit;
  transition: all ${ThemeProps.animations.swift};
  box-sizing: border-box;
  font-family: monospace;
  &:hover {
    border-color: ${props =>
      props.highlight ? ThemePalette.alert : ThemePalette.primary};
  }
  &:focus {
    border-color: ${props =>
      props.highlight ? ThemePalette.alert : ThemePalette.primary};
    outline: none;
  }
  &:disabled {
    color: ${ThemePalette.grayscale[3]};
    border-color: ${ThemePalette.grayscale[0]};
    background-color: ${ThemePalette.grayscale[0]};
  }
  &::placeholder {
    color: ${ThemePalette.grayscale[3]};
  }
`;
@observer
class TextArea extends React.Component<any> {
  render() {
    return (
      <Wrapper>
        <Input
          {...this.props}
          disabled={this.props.disabled || this.props.disabledLoading}
          disabledLoading={this.props.disabledLoading}
          ref={(r: any) => {
            if (this.props.ref) {
              this.props.ref(r);
            } else if (this.props.customRef) {
              this.props.customRef(r);
            }
          }}
        />
        {this.props.required ? <Required /> : null}
      </Wrapper>
    );
  }
}

export default TextArea;
