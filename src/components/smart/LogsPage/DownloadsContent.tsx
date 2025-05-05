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

import { DateTime } from "luxon";
import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import { ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import DatetimePicker from "@src/components/ui/DatetimePicker";
import LoadingButton from "@src/components/ui/LoadingButton";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import { Close } from "@src/components/ui/TextInput";
import DateUtils from "@src/utils/DateUtils";

import downloadImage from "./images/download.svg";

import type { Log as LogType } from "@src/@types/Log";
const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
const Info = styled.div<any>``;
const InfoUtc = styled.div`
  display: flex;
  font-size: 12px;
  align-items: center;
  margin-top: 16px;
  > div {
    margin-right: 8px;
  }
`;
const Dates = styled.div<any>`
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: -48px;
  margin-top: 16px;
`;
const DateWrapper = styled.div<any>`
  position: relative;
  margin-left: 48px;
`;
const DateLabel = styled.div<any>`
  font-weight: ${ThemeProps.fontWeights.medium};
`;
const DateInput = styled.div<any>`
  margin-top: 4px;
  display: flex;
  align-items: center;
`;
const CloseButton = styled(Close)`
  right: -24px;
  top: 29px;
`;
const Logs = styled.div<any>`
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 0;
  margin-top: 48px;
`;
const Log = styled.div<any>`
  display: flex;
  align-items: center;
  margin-top: 16px;
  flex-shrink: 0;
  :first-child {
    margin-top: 0;
  }
`;
const LogName = styled.div<any>`
  margin-left: 16px;
`;
const LogDownload = styled.div<any>`
  ${ThemeProps.exactSize("16px")}
  background: url('${downloadImage}') center no-repeat;
  background-size: contain;
  cursor: pointer;
`;
const Seperator = styled.div<any>`
  width: 465px;
  height: 1px;
  background: #d6d6d6;
  margin-top: 16px;
`;

type State = {
  startDate: Date | null;
  endDate: Date | null;
};
type Props = {
  logs: LogType[];
  onDownloadClick: (
    logName: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ) => void;
  generatingDiagnostics: boolean;
  downloadingAll: boolean;
};
@observer
class DownloadsContent extends React.Component<Props, State> {
  state: State = {
    startDate: null,
    endDate: null,
  };

  handleStartDateChange(startDate: Date) {
    this.setState({ startDate });
  }

  handleEndDateChange(endDate: Date) {
    this.setState({ endDate });
  }

  renderDates() {
    const toUtc = (date: Date) => DateUtils.getUtcDate(date);

    return (
      <Dates>
        <DateWrapper>
          <DateLabel>Start Date</DateLabel>
          <DateInput>
            <DatetimePicker
              value={this.state.startDate}
              onChange={date => {
                this.handleStartDateChange(date);
              }}
              timezone="utc"
              isValidDate={date => toUtc(date) < DateTime.utc()}
              dispatchChangeContinously
            />
            <CloseButton
              show={this.state.startDate}
              onClick={() => {
                this.setState({ startDate: null });
              }}
            />
          </DateInput>
        </DateWrapper>
        <DateWrapper>
          <DateLabel>End Date</DateLabel>
          <DateInput>
            <DatetimePicker
              value={this.state.endDate}
              onChange={date => {
                this.handleEndDateChange(date);
              }}
              timezone="utc"
              isValidDate={date => {
                const utcDate = toUtc(date);
                const diffNow = utcDate.diffNow().milliseconds;
                if (this.state.startDate) {
                  // Convert the start date to UTC and subtract one day
                  const startDate = toUtc(this.state.startDate).minus({
                    days: 1,
                  });
                  // Return true if the selected date is before now and after the start date
                  return (
                    diffNow < 0 && utcDate.diff(startDate).milliseconds > 0
                  );
                }
                // If no start date is set, return true if the selected date is before now
                return diffNow < 0;
              }}
              dispatchChangeContinously
            />
            <CloseButton
              show={this.state.endDate}
              onClick={() => {
                this.setState({ endDate: null });
              }}
            />
          </DateInput>
        </DateWrapper>
      </Dates>
    );
  }

  renderLogs() {
    return (
      <Logs>
        <Log>
          {this.props.generatingDiagnostics ? (
            <StatusIcon status="RUNNING" />
          ) : (
            <LogDownload
              onClick={() => {
                this.props.onDownloadClick("__diagnostics__");
              }}
            />
          )}
          <LogName>diagnostics</LogName>
        </Log>
        <Log>
          <LogDownload
            onClick={() => {
              this.props.onDownloadClick("__ui__");
            }}
          />
          <LogName>web-requests</LogName>
        </Log>
        <Seperator />
        {this.props.logs.map(log => (
          <Log key={log.log_name}>
            <LogDownload
              onClick={() => {
                this.props.onDownloadClick(
                  log.log_name,
                  this.state.startDate,
                  this.state.endDate,
                );
              }}
            />
            <LogName>{log.log_name}</LogName>
          </Log>
        ))}
      </Logs>
    );
  }

  render() {
    return (
      <Wrapper>
        <Info>Optional time range for log download:</Info>
        {this.renderDates()}
        <InfoUtc>
          <StatusIcon status="UNSCHEDULED" />
          Start and End times must be set in server&apos;s timezone
        </InfoUtc>
        {this.props.downloadingAll ? (
          <LoadingButton style={{ marginTop: "32px" }}>
            Generating Logs ...
          </LoadingButton>
        ) : (
          <Button
            style={{ marginTop: "32px" }}
            onClick={() => {
              this.props.onDownloadClick(
                "__all__",
                this.state.startDate,
                this.state.endDate,
              );
            }}
          >
            Download All Logs
          </Button>
        )}

        {this.renderLogs()}
      </Wrapper>
    );
  }
}

export default DownloadsContent;
