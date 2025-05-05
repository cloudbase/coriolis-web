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
import styled from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";

const backgroundColor = (props: any) => {
  if (props.hollow) {
    if (props.transparent) {
      return "transparent";
    }
    return "white";
  }
  if (props.secondary) {
    return ThemePalette.secondaryLight;
  }
  if (props.alert) {
    return ThemePalette.alert;
  }
  return ThemePalette.primary;
};
const disabledBackgroundColor = (props: any) => {
  if (props.secondary && props.hollow) {
    return ThemePalette.grayscale[7];
  }
  return backgroundColor(props);
};

const hoverBackgroundColor = (props: any) => {
  if (props.disabled && props.secondary && props.hollow) {
    return ThemePalette.grayscale[7];
  }

  if (props.secondary) {
    return ThemePalette.grayscale[8];
  }

  if (props.hoverPrimary) {
    return ThemePalette.primary;
  }

  if (props.alert) {
    return ThemePalette.alert;
  }
  return ThemePalette.primary;
};

const border = (props: any) => {
  if (props.hollow) {
    if (props.secondary) {
      return `border: 1px solid ${ThemePalette.grayscale[3]};`;
    }
    if (props.alert) {
      return `border: 1px solid ${ThemePalette.alert};`;
    }
    return `border: 1px solid ${ThemePalette.primary};`;
  }
  return "";
};
const disabledBorder = (props: any) => {
  if (props.secondary && props.hollow) {
    return "border: none;";
  }
  return border(props);
};

const color = (props: any) => {
  if (props.hollow) {
    if (props.secondary) {
      return props.disabled ? ThemePalette.grayscale[3] : ThemePalette.black;
    }
    if (props.alert) {
      return ThemePalette.alert;
    }
    return ThemePalette.primary;
  }
  return "white";
};
const getWidth = (props: any) => {
  if (props.width) {
    return props.width;
  }

  if (props.large) {
    return `${ThemeProps.inputSizes.large.width}px`;
  }
  return `${ThemeProps.inputSizes.regular.width}px`;
};
const StyledButton = styled.button`
  ${ThemeProps.exactHeight("32px")}
  border-radius: 4px;
  margin: 0;
  background-color: ${props => backgroundColor(props)};
  border: none;
  ${props => border(props)}
  color: ${props => color(props)};
  padding: 0;
  ${props => ThemeProps.exactWidth(getWidth(props))}
  cursor: pointer;
  font-size: inherit;
  transition:
    background-color ${ThemeProps.animations.swift},
    opacity ${ThemeProps.animations.swift};
  &:disabled {
    opacity: ${(props: any) => (props.secondary ? 1 : 0.7)};
    cursor: not-allowed;
    background-color: ${props => disabledBackgroundColor(props)};
    ${props => disabledBorder(props)}
  }
  &:hover {
    ${(props: any) =>
      props.hollow
        ? `color: ${props.disabled ? ThemePalette.grayscale[3] : "white"};`
        : ""}
    background-color: ${props => hoverBackgroundColor(props)};
  }
  &:focus {
    outline: none;
  }
`;

const Button = (props: any) => (
  <StyledButton
    {...props}
    onFocus={e => {
      e.target.blur();
    }}
  />
);

export default Button;
