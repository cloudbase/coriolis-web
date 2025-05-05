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
import { Link } from "react-router";

import { ThemeProps } from "@src/components/Theme";
import coriolisLargeImage from "./images/coriolis-large.svg";
import coriolisSmallImage from "./images/coriolis-small.svg";
import coriolisSmallBlackImage from "./images/coriolis-small-black.svg";

const largeProps = css`
  width: 256px;
  height: 307px;
  background: url("${coriolisLargeImage}") center no-repeat;
`;

const smallProps = css`
  width: 245px;
  height: 48px;
  background: url("${coriolisSmallImage}") center no-repeat;
`;

const smallblackProps = css`
  width: 245px;
  height: 48px;
  background: url("${coriolisSmallBlackImage}") center no-repeat;
`;
const LinkStyled = styled(Link)`
  transition: all ${ThemeProps.animations.swift};
`;
const Coriolis = styled.div<any>`
  ${props =>
    props.small ? smallProps : props.smallblack ? smallblackProps : largeProps}
  ${props =>
    !props.large && !props.small && !props.smallblack
      ? css`
          @media (max-height: 760px) {
            width: 246px;
            height: 42px;
            background: url("${coriolisSmallImage}") center no-repeat;
          }
        `
      : ""}
`;

type Props = {
  small?: boolean;
  smallblack?: boolean;
  large?: boolean;
  customRef?: (ref: HTMLElement) => void;
  to?: string;
  className?: string;
};

class Logo extends React.Component<Props> {
  render() {
    const { to = "/", large, small, smallblack, className, customRef } = this.props;
    const normalizedTo = to.startsWith("/") ? to : `../${to}`;

    const coriolisLogo = (
      <Coriolis
        large={large}
        small={small}
        smallblack={smallblack}
      />
    );
    const logoWrapper = normalizedTo ? (
      <LinkStyled to={normalizedTo}>{coriolisLogo}</LinkStyled>
    ) : (
      <div>{coriolisLogo}</div>
    );
    return (
      <div
        style={{ transition: `all ${ThemeProps.animations.swift}` }}
        className={className}
        ref={ref => {
          if (customRef && ref) customRef(ref);
        }}
      >
        {logoWrapper}
      </div>
    );
  }
}

export default Logo;
