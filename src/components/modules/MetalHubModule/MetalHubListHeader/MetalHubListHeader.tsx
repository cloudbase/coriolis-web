/*
Copyright (C) 2022  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import CopyValue from "@src/components/ui/CopyValue";
import Button from "@src/components/ui/Button";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import InfoIcon from "@src/components/ui/InfoIcon";

const Wrapper = styled.div<{ visible: boolean }>`
  display: ${props => (props.visible ? "flex" : "none")};
  align-items: center;
  justify-content: flex-end;
  margin-top: -66px;
  margin-bottom: 32px;
  margin-left: 320px;
  transition: all ${ThemeProps.animations.swift};
`;
const FingerPrint = styled.div`
  margin-right: 32px;
`;
const FingerPrintLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`;
const FingerPrintValue = styled.div``;

type Props = {
  hideButton: boolean;
  error: string;
  fingerprint: string;
  visible: boolean;
  onCreateClick: () => void;
};

@observer
class MetalHubListHeader extends React.Component<Props> {
  renderContent() {
    let valueContent: React.ReactNode = this.props.error;

    if (!this.props.error) {
      const cleanFingerprint = this.props.fingerprint.replace(/\n/g, "");
      const fingerprintShortened = `${cleanFingerprint.slice(
        0,
        12,
      )}...${cleanFingerprint.slice(-12)}`;
      valueContent = (
        <CopyValue value={cleanFingerprint} label={fingerprintShortened} />
      );
    }
    return (
      <FingerPrint>
        <FingerPrintLabel>
          Coriolis Bare Metal Hub Fingerprint{" "}
          <InfoIcon text="The fingerprint is used when installing the agent on the Bare Metal" />{" "}
        </FingerPrintLabel>
        <FingerPrintValue>{valueContent}</FingerPrintValue>
      </FingerPrint>
    );
  }

  render() {
    return (
      <Wrapper visible={this.props.visible}>
        {this.renderContent()}
        {!this.props.hideButton ? (
          <Button hollow onClick={this.props.onCreateClick}>
            Add a Bare Metal Server
          </Button>
        ) : null}
      </Wrapper>
    );
  }
}

export default MetalHubListHeader;
