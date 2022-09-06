/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import styled, { css } from "styled-components";
import { observer } from "mobx-react";
import { ThemePalette, ThemeProps } from "@src/components/Theme";

import loadingImage from "./images/loading.svg";

const Wrapper = styled.div<any>`
  display: flex;
  min-height: 0;
  flex-grow: 1;
  position: relative;
`;
const Navigation = styled.div<any>`
  width: 224px;
  background-image: linear-gradient(
    rgba(200, 204, 215, 0.54),
    rgba(164, 170, 181, 0.54)
  );
`;
const NavigationItemDiv = styled.div<any>`
  position: relative;
  height: 47px;
  border-bottom: 1px solid ${ThemePalette.grayscale[2]};
  color: ${props => (props.disabled ? ThemePalette.grayscale[3] : "black")};
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 18px;
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
  ${props =>
    props.selected
      ? css`
          color: ${ThemePalette.primary};
          background: ${ThemePalette.grayscale[2]};
          cursor: default;
        `
      : ""}
`;
const Content = styled.div<any>`
  width: 576px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
const ReloadButton = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[4]};
  &:hover {
    color: ${ThemePalette.primary};
  }
  cursor: pointer;
  position: absolute;
  bottom: 42px;
  left: 32px;
`;
const Loading = styled.span`
  position: absolute;
  top: 15px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: url("${loadingImage}") center no-repeat;
  ${ThemeProps.animations.rotation}
`;

type NavigationItem = {
  label: string;
  value: string;
  disabled?: boolean;
  title?: string;
  loading?: boolean;
};

type Props = {
  navigationItems: NavigationItem[];
  content: React.ReactNode;
  selectedValue: string | null;
  onChange: (item: NavigationItem) => void;
  style?: any;
  reloadLabel: string;
  onReloadClick: () => void;
};

@observer
class Panel extends React.Component<Props> {
  handleItemClick(item: NavigationItem) {
    if (item.disabled) {
      return;
    }
    if (item.value !== this.props.selectedValue) {
      this.props.onChange(item);
    }
  }

  render() {
    return (
      <Wrapper style={this.props.style}>
        <Navigation>
          {this.props.navigationItems.map((item, i) => (
            <NavigationItemDiv
              key={item.value}
              selected={
                this.props.selectedValue
                  ? this.props.selectedValue === item.value
                  : i === 0
              }
              onClick={() => {
                this.handleItemClick(item);
              }}
              disabled={item.disabled}
              title={item.title}
            >
              {item.label}
              {item.loading ? <Loading /> : null}
            </NavigationItemDiv>
          ))}
        </Navigation>
        <Content>{this.props.content}</Content>
        <ReloadButton
          onClick={() => {
            this.props.onReloadClick();
          }}
        >
          {this.props.reloadLabel}
        </ReloadButton>
      </Wrapper>
    );
  }
}

export default Panel;
