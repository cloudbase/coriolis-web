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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";
import { ThemeProps } from "@src/components/Theme";
import questionFilledImage from "./images/question-filled.svg";
import questionImage from "./images/question.svg";
import warningImage from "./images/warning.svg";

const Wrapper = styled.div<any>`
  ${ThemeProps.exactSize("16px")}
  background: url('${(props: any) =>
    props.warning
      ? warningImage
      : props.filled
        ? questionFilledImage
        : questionImage}') center no-repeat;
  display: inline-block;
  margin-left: ${(props: any) =>
    props.marginLeft != null ? `${props.marginLeft}px` : "4px"};
  margin-bottom: ${(props: any) =>
    props.marginBottom != null ? `${props.marginBottom}px` : "-4px"};
`;
type Props = {
  text: string;
  marginLeft?: number | null;
  marginBottom?: number | null;
  className?: string;
  style?: React.CSSProperties;
  warning?: boolean;
  filled?: boolean;
};
@observer
class InfoIcon extends React.Component<Props> {
  render() {
    return (
      <Wrapper
        data-tip={this.props.text}
        marginLeft={this.props.marginLeft}
        marginBottom={this.props.marginBottom}
        className={this.props.className}
        warning={this.props.warning}
        filled={this.props.filled}
        style={this.props.style}
      />
    );
  }
}

export default InfoIcon;
