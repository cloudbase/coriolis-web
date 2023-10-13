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
import { createGlobalStyle } from "styled-components";
import ReactTooltip from "react-tooltip";

import { ThemePalette, ThemeProps } from "@src/components/Theme";

const GlobalStyle = createGlobalStyle`
  .reactTooltip {
    max-width: 192px;
    box-shadow: 0 0 9px 1px rgba(32, 34, 52, 0.1);
    z-index: 999999 !important;
    transition: opacity ${ThemeProps.animations.swift} !important;
  }
`;

@observer
class Tooltip extends React.Component {
  intervalId: number | undefined;

  componentDidMount() {
    if (this.intervalId) {
      return;
    }
    this.intervalId = window.setInterval(() => {
      ReactTooltip.rebuild();
    }, 1000);
  }

  render() {
    return (
      <>
        <ReactTooltip
          place="right"
          effect="solid"
          multiline
          className="reactTooltip"
          backgroundColor={ThemePalette.grayscale[1]}
          textColor={ThemePalette.grayscale[4]}
          padding="8px"
        />
        <GlobalStyle />
      </>
    );
  }
}

export default Tooltip;
