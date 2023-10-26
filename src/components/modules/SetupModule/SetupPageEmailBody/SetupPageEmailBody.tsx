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

import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import {
  CustomerInfoBasic,
  CustomerInfoTrial,
  SetupPageLicenceType,
} from "@src/@types/InitialSetup";
import SetupPageInputWrapper from "@src/components/modules/SetupModule/ui/SetupPageInputWrapper";
import SetupPageServerError from "@src/components/modules/SetupModule/ui/SetupPageServerError";
import { ThemePalette } from "@src/components/Theme";
import CopyButton from "@src/components/ui/CopyButton";
import { customerInfoSetupStoreValueToString } from "@src/stores/SetupStore";
import DomUtils from "@src/utils/DomUtils";

const Wrapper = styled.div``;
const Link = styled.a`
  color: ${ThemePalette.primary};
  text-decoration: none;
`;
const EmailBody = styled.div``;
const EmailSubject = styled.div``;
const EmailContent = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 4px;
`;
const EmailBodyContent = styled.div``;
const CopyLink = styled.div`
  width: 220px;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  margin-bottom: 16px;
`;

type Props = {
  customerInfoBasic: CustomerInfoBasic;
  customerInfoTrial: CustomerInfoTrial;
  licenceType: SetupPageLicenceType;
  applianceId: string;
};

@observer
class SetupPageEmailBody extends React.Component<Props> {
  emailTemplate: HTMLElement | null = null;

  async handleCopy(event?: React.ClipboardEvent) {
    event?.preventDefault();

    if (!this.emailTemplate) {
      return;
    }

    const range = document.createRange();
    range.selectNode(this.emailTemplate);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await DomUtils.copyTextToClipboard(window.getSelection()?.toString() || "");
  }

  render() {
    const emailTemplate = (
      <div>
        Hi,
        <br />
        <br />
        I would like to request a Coriolis Licence with the following info:
        <br />
        <br />
        <b>Full Name</b>: {this.props.customerInfoBasic.fullName}
        <br />
        <b>Email</b>: {this.props.customerInfoBasic.email}
        <br />
        <b>Company</b>: {this.props.customerInfoBasic.company}
        <br />
        <b>Country</b>: {this.props.customerInfoBasic.country}
        <br />
        {this.props.licenceType === "trial" ? (
          <>
            <b>Interested In</b>:{" "}
            {customerInfoSetupStoreValueToString(
              "interestedIn",
              this.props.customerInfoTrial.interestedIn
            )}
            <br />
            <b>Source Platform</b>:{" "}
            {customerInfoSetupStoreValueToString(
              "sourcePlatform",
              this.props.customerInfoTrial.sourcePlatform
            )}
            <br />
            <b>Destination Platform</b>:{" "}
            {customerInfoSetupStoreValueToString(
              "destinationPlatform",
              this.props.customerInfoTrial.destinationPlatform
            )}
            <br />
          </>
        ) : null}
        <b>Licence Type</b>: {this.props.licenceType}
        <br />
        <b>Appliance ID</b>: {this.props.applianceId}
        <br />
        <br />
        Regards,
        <br />
        {this.props.customerInfoBasic.fullName}
      </div>
    );
    return (
      <Wrapper>
        <SetupPageServerError style={{ marginTop: "-16px" }}>
          <p>
            There was an error submitting the form to Cloudbase Solutions
            support.
          </p>
          <p>
            Please send the following email body to{" "}
            <Link href="mailto:support@cloudbase.it" target="_blank">
              support@cloudbase.it
            </Link>
            .
          </p>
        </SetupPageServerError>
        <EmailBody>
          <EmailSubject>
            <SetupPageInputWrapper label="Subject">
              <EmailContent>Coriolis Licence Request</EmailContent>
            </SetupPageInputWrapper>
          </EmailSubject>
          <EmailBodyContent>
            <SetupPageInputWrapper label="Body">
              <EmailContent
                onCopy={e => {
                  this.handleCopy(e);
                }}
              >
                {emailTemplate}
              </EmailContent>
            </SetupPageInputWrapper>
            <CopyLink
              onClick={() => {
                this.handleCopy();
              }}
            >
              <CopyButton style={{ opacity: 1, marginRight: "8px" }} />
              Copy email body to clipboard
            </CopyLink>
          </EmailBodyContent>
        </EmailBody>
        <div
          style={{
            position: "absolute",
            top: "-100000px",
            color: "black",
            background: "white",
          }}
          ref={ref => {
            this.emailTemplate = ref;
          }}
        >
          {emailTemplate}
        </div>
      </Wrapper>
    );
  }
}

export default SetupPageEmailBody;
