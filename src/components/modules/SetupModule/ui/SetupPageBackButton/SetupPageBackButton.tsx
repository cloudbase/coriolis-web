/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import styled from "styled-components";
import { ThemePalette } from "@src/components/Theme";
import Arrow from "@src/components/ui/Arrow";

const Wrapper = styled.div`
  color: ${ThemePalette.primary};
  width: 98px;
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0 8px 0 3px;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
type Props = {
  onClick: () => void;
};

@observer
class SetupPageBackButton extends React.Component<Props> {
  render() {
    return (
      <Wrapper onClick={this.props.onClick}>
        <Arrow orientation="left" primary style={{ marginRight: "4px" }} />
        Back
      </Wrapper>
    );
  }
}

export default SetupPageBackButton;
