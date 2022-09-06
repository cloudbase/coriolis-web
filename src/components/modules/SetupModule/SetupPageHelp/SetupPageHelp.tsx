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
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import SetupPageTitle from "@src/components/modules/SetupModule/ui/SetupPageTitle";
import OpenInNewIcon from "@src/components/ui/OpenInNewIcon";

const Wrapper = styled.div``;
const Help = styled.a`
  display: flex;
  align-items: center;
  color: ${ThemePalette.primary};
  cursor: pointer;
  text-decoration: none;
  max-width: 190px;
  margin-bottom: 16px;
`;
const OpenInNewIconWrapper = styled.div`
  ${ThemeProps.exactSize("16px")}
  position: relative;
  top: -2px;
  transform: scale(0.6);
`;
type Props = {
  style: React.CSSProperties;
};

@observer
class SetupPageHelp extends React.Component<Props> {
  render() {
    return (
      <Wrapper style={this.props.style}>
        <SetupPageTitle title="Coriolis® Help" />
        <p>
          Click the link below to view the Coriolis® documentation. There you
          can find all the help you need to get you started.
        </p>
        <Help href="https://cloudbase.it/coriolis-overview/" target="_balnk">
          Coriolis® Documentation
          <OpenInNewIconWrapper
            dangerouslySetInnerHTML={{
              __html: OpenInNewIcon(ThemePalette.primary),
            }}
          />
        </Help>
      </Wrapper>
    );
  }
}

export default SetupPageHelp;
