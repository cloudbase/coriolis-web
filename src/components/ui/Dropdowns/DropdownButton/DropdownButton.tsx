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
import styled, { css } from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import arrowImage from "./images/arrow";

const getLabelColor = (props: any) => {
  if (props.disabled) {
    return ThemePalette.grayscale[3];
  }

  if (props.primary || props.secondary) {
    return "white";
  }

  return ThemePalette.black;
};
const Label = styled.div<any>`
  color: ${(props: any) => getLabelColor(props)};
  margin: 0 32px 0 ${(props: any) => (props.embedded ? 0 : 16)}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  ${(props: any) =>
    props.useBold ? `font-weight: ${ThemeProps.fontWeights.medium};` : ""}
  ${(props: any) => (props.centered ? "text-align: center;" : "")}
`;

const getBackgroundColor = (props: any) => {
  if (props.embedded) {
    return "white";
  }

  if (props.disabled) {
    return ThemePalette.grayscale[0];
  }

  if (props.secondary) {
    return ThemePalette.secondaryLight;
  }

  if (props.primary) {
    return ThemePalette.primary;
  }

  return "white";
};
const getArrowColor = (props: any) => {
  if (props.disabled) {
    return ThemePalette.grayscale[3];
  }

  if (props.primary || props.secondary) {
    return "white";
  }

  if (props.outline) {
    return ThemePalette.primary;
  }

  return ThemePalette.black;
};
const getWidth = (props: any) => {
  if (props.large) {
    return ThemeProps.inputSizes.large.width - 2;
  }
  if (props.width) {
    return props.width - 2;
  }
  return ThemeProps.inputSizes.regular.width - 2;
};
const borderColor = (props: any) => {
  if (props.highlight) {
    return ThemePalette.alert;
  }
  if (props.disabled) {
    return ThemePalette.grayscale[0];
  }
  if (props.primary) {
    return ThemePalette.primary;
  }
  if (props.secondary) {
    return ThemePalette.secondaryLight;
  }
  if (props.outline) {
    return ThemePalette.primary;
  }
  return ThemePalette.grayscale[3];
};
const backgroundHover = (props: any) => {
  if (props.disabled || props.embedded) {
    return "";
  }
  if (props.secondary) {
    return ThemePalette.secondaryLight;
  }
  return ThemePalette.primary;
};

const Wrapper = styled.div<any>`
  display: flex;
  align-items: center;
  position: relative;
  width: ${(props: any) => getWidth(props)}px;
  height: ${(props: any) =>
    props.large
      ? ThemeProps.inputSizes.large.height - 2
      : ThemeProps.inputSizes.regular.height - 2}px;
  border: 1px solid ${props => borderColor(props)};
  border-radius: ${ThemeProps.borderRadius};
  cursor: ${(props: any) => (props.disabled ? "default" : "pointer")};
  transition: all ${ThemeProps.animations.swift};
  background: ${props => getBackgroundColor(props)};
  ${(props: any) =>
    props.embedded
      ? css`
          border: 0;
          width: calc(100% + 8px);
        `
      : ""}

  #dropdown-arrow-image {
    stroke: ${(props: any) => getArrowColor(props)};
  }
  &:hover {
    #dropdown-arrow-image {
      stroke: ${(props: any) =>
        props.disabled ? "" : props.embedded ? "" : "white"};
    }
    background: ${(props: any) => backgroundHover(props)};
  }

  &:hover ${Label} {
    color: ${(props: any) =>
      props.disabled ? "" : props.embedded ? "" : "white"};
  }
  ${(props: any) =>
    props.disabledLoading ? ThemeProps.animations.disabledLoading : ""}
`;
const Arrow = styled.div<any>`
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  width: 16px;
  height: 16px;
  justify-content: center;
  align-items: center;
`;
type Props = {
  value: string;
  onClick?: (event: Event) => void;
  customRef?: (ref: HTMLElement) => void;
  ref?: (ref: HTMLElement) => void;
  arrowRef?: (ref: HTMLElement) => void;
  className?: string;
  disabled?: boolean;
  disabledLoading?: boolean;
  embedded?: boolean;
  highlight?: boolean;
  secondary?: boolean;
  centered?: boolean;
  outline?: boolean;
  primary?: boolean;
  width?: number;
  useBold?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
};
class DropdownButton extends React.Component<Props> {
  render() {
    const disabled = this.props.disabled || this.props.disabledLoading;
    return (
      <Wrapper
        {...this.props}
        disabled={disabled}
        disabledLoading={this.props.disabledLoading}
        ref={(e: HTMLElement) => {
          if (this.props.customRef) {
            this.props.customRef(e);
          } else if (this.props.ref) {
            this.props.ref(e);
          }
        }}
        onClick={(e: Event) => {
          if (!disabled && this.props.onClick) this.props.onClick(e);
        }}
      >
        <Label
          {...this.props}
          onClick={() => {}}
          ref={() => {}}
          disabled={disabled}
        >
          {this.props.value}
        </Label>
        <Arrow
          {...this.props}
          ref={(ref: HTMLElement) => {
            if (this.props.arrowRef) this.props.arrowRef(ref);
          }}
          onClick={() => {}}
          disabled={disabled}
          dangerouslySetInnerHTML={{ __html: arrowImage }}
        />
      </Wrapper>
    );
  }
}

export default DropdownButton;
