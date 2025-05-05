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
import styled, { createGlobalStyle } from "styled-components";

import reloadImage from "./images/reload.svg";

const Wrapper = styled.div<any>`
  width: 16px;
  height: 16px;
  background: url("${reloadImage}") no-repeat center;
  cursor: pointer;
`;

const GlobalStyle = createGlobalStyle`
  .reload-animation {
    transform: rotate(360deg);
    transition: transform 1s cubic-bezier(0, 1.4, 1, 1);
  }
`;

type Props = {
  onClick: () => void;
  style?: React.CSSProperties;
};
@observer
class ReloadButton extends React.Component<Props> {
  wrapper: HTMLElement | undefined | null;

  timeout: number | undefined | null;

  onClick() {
    if (this.timeout) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick();
    }

    const nonNullWrapper = this.wrapper;
    if (!nonNullWrapper) {
      return;
    }

    nonNullWrapper.className += " reload-animation";
    this.timeout = window.setTimeout(() => {
      nonNullWrapper.className = nonNullWrapper.className.substr(
        0,
        nonNullWrapper.className.indexOf(" reload-animation")
      );
      this.timeout = null;
    }, 1000);
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <Wrapper
          ref={(div: HTMLElement | null | undefined) => {
            this.wrapper = div;
          }}
          {...this.props}
          onClick={() => {
            this.onClick();
          }}
        />
      </>
    );
  }
}

export default ReloadButton;
