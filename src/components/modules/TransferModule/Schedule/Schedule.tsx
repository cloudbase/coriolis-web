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

import TransferExecutionOptions from "@src/components/modules/TransferModule/TransferExecutionOptions";
import ScheduleItem from "@src/components/modules/TransferModule/ScheduleItem";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import AlertModal from "@src/components/ui/AlertModal";
import Button from "@src/components/ui/Button";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import LoadingButton from "@src/components/ui/LoadingButton";
import Modal from "@src/components/ui/Modal";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import DateUtils from "@src/utils/DateUtils";

import scheduleImage from "./images/schedule.svg";

import type { Schedule as ScheduleType } from "@src/@types/Schedule";
import type { Field } from "@src/@types/Field";

const Wrapper = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
`;
const LoadingWrapper = styled.div<any>`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const LoadingText = styled.div<any>`
  margin-top: 38px;
  font-size: 18px;
`;
const Table = styled.div<any>``;
const Header = styled.div<any>`
  display: flex;
  margin-bottom: 4px;
`;
const HeaderData = styled.div<any>`
  width: ${props => props.width};
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[5]};
  text-transform: uppercase;
`;
const Body = styled.div<any>``;
const NoSchedules = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => (props.secondary ? 56 : 80)}px 80px 80px 80px;
  background: ${props =>
    props.secondary ? "white" : ThemePalette.grayscale[7]};
`;
const NoSchedulesTitle = styled.div<any>`
  margin-bottom: 10px;
  font-size: 18px;
`;
const NoSchedulesSubtitle = styled.div<any>`
  margin-bottom: 45px;
  color: ${ThemePalette.grayscale[4]};
`;
const ScheduleImage = styled.div<any>`
  ${ThemeProps.exactSize("96px")}
  background: url('${scheduleImage}') no-repeat center;
  margin-bottom: 46px;
`;
const Footer = styled.div<any>`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;
const Timezone = styled.div<any>`
  display: flex;
  align-items: center;
`;
const TimezoneLabel = styled.div<any>`
  margin-right: 4px;
`;
const Buttons = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

type TimeZoneValue = "local" | "utc";
type Props = {
  schedules: ScheduleType[] | null;
  unsavedSchedules: ScheduleType[];
  timezone: TimeZoneValue;
  disableExecutionOptions: boolean;
  onTimezoneChange: (timezone: TimeZoneValue) => void;
  onAddScheduleClick: (schedule: ScheduleType) => void;
  onChange: (
    scheduleId: string,
    schedule: ScheduleType,
    forceSave?: boolean
  ) => void;
  onRemove: (scheduleId: string) => void;
  onSaveSchedule?: (schedule: ScheduleType) => void;
  adding?: boolean;
  loading?: boolean;
  savingIds?: string[];
  enablingIds?: string[];
  deletingIds?: string[];
  secondaryEmpty?: boolean;
};
type State = {
  showOptionsModal: boolean;
  showDeleteConfirmation: boolean;
  selectedSchedule: ScheduleType | null;
  executionOptions: { [prop: string]: any } | null;
};

const COL_WIDTHS = ["6%", "18%", "10%", "18%", "10%", "10%", "23%", "5%"];
@observer
class Schedule extends React.Component<Props, State> {
  static defaultProps = {
    unsavedSchedules: [],
  };

  state: State = {
    showOptionsModal: false,
    showDeleteConfirmation: false,
    selectedSchedule: null,
    executionOptions: null,
  };

  handleDeleteClick(selectedSchedule: ScheduleType) {
    this.setState({ showDeleteConfirmation: true, selectedSchedule });
  }

  handleCloseDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false });
  }

  handleDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false });
    if (this.state.selectedSchedule?.id) {
      this.props.onRemove(this.state.selectedSchedule.id);
    }
  }

  handleShowOptions(selectedSchedule: ScheduleType) {
    this.setState({
      showOptionsModal: true,
      executionOptions: selectedSchedule,
      selectedSchedule,
    });
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false });
  }

  handleOptionsSave(fields: Field[]) {
    this.setState({ showOptionsModal: false });
    let execOptions = this.state.executionOptions;
    if (!execOptions) {
      execOptions = {};
    }
    const options: any = {};
    fields.forEach(f => {
      options[f.name] = f.value || execOptions![f.name] || false;
    });

    if (this.state.selectedSchedule && this.state.selectedSchedule.id) {
      this.props.onChange(this.state.selectedSchedule.id, options, true);
    }
  }

  handleExecutionOptionsChange(fieldName: string, value: string) {
    this.setState(prevState => {
      let options = prevState.executionOptions;
      if (!options) {
        options = {};
      }
      options = {
        ...options,
      };
      options[fieldName] = value;

      return { executionOptions: options };
    });
  }

  handleAddScheduleClick() {
    let hour = 0;
    if (this.props.timezone === "local") {
      hour = DateUtils.getUtcHour(0);
    }
    this.props.onAddScheduleClick({ schedule: { hour, minute: 0 } });
  }

  renderLoading() {
    if (!this.props.loading) {
      return null;
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading schedules...</LoadingText>
      </LoadingWrapper>
    );
  }

  renderHeader() {
    const headerLabels = [
      "Run",
      "Month",
      "Day of month",
      "Day of week",
      "Hour",
      "Minute",
      "Expires",
      "Options",
    ];

    return (
      <Header>
        {headerLabels.map((l, i) => (
          <HeaderData key={l} width={COL_WIDTHS[i]}>
            {l}
          </HeaderData>
        ))}
      </Header>
    );
  }

  renderBody() {
    if (!this.props.schedules) {
      return null;
    }

    return (
      <Body>
        {this.props.schedules.map(schedule => (
          <ScheduleItem
            key={schedule.id}
            colWidths={COL_WIDTHS}
            item={schedule}
            unsavedSchedules={this.props.unsavedSchedules}
            timezone={this.props.timezone}
            onChange={(data, forceSave) => {
              if (schedule.id)
                this.props.onChange(schedule.id, data, forceSave);
            }}
            onSaveSchedule={() => {
              if (this.props.onSaveSchedule)
                this.props.onSaveSchedule(schedule);
            }}
            onShowOptionsClick={() => {
              this.handleShowOptions(schedule);
            }}
            onDeleteClick={() => {
              this.handleDeleteClick(schedule);
            }}
            saving={Boolean(
              this.props.savingIds?.find(id => id === schedule.id)
            )}
            enabling={Boolean(
              this.props.enablingIds?.find(id => id === schedule.id)
            )}
            deleting={Boolean(
              this.props.deletingIds?.find(id => id === schedule.id)
            )}
          />
        ))}
      </Body>
    );
  }

  renderTable() {
    if (
      !this.props.schedules ||
      this.props.schedules.length === 0 ||
      this.props.loading
    ) {
      return null;
    }

    return (
      <Table>
        {this.renderHeader()}
        {this.renderBody()}
      </Table>
    );
  }

  renderNoSchedules() {
    if (
      (this.props.schedules && this.props.schedules.length > 0) ||
      this.props.loading
    ) {
      return null;
    }

    return (
      <NoSchedules secondary={this.props.secondaryEmpty}>
        <ScheduleImage />
        <NoSchedulesTitle>
          {this.props.secondaryEmpty
            ? "Schedule this Transfer"
            : "This Transfer has no Schedules."}
        </NoSchedulesTitle>
        <NoSchedulesSubtitle>
          {this.props.secondaryEmpty
            ? "You can schedule this Transfer so that it executes automatically."
            : "Add a new schedule so that the Transfer executes automatically."}
        </NoSchedulesSubtitle>
        {this.props.adding ? (
          <LoadingButton>Adding ...</LoadingButton>
        ) : (
          <Button
            hollow={this.props.secondaryEmpty}
            onClick={() => {
              this.handleAddScheduleClick();
            }}
          >
            Add Schedule
          </Button>
        )}
      </NoSchedules>
    );
  }

  renderFooter() {
    if (
      !this.props.schedules ||
      this.props.schedules.length === 0 ||
      this.props.loading
    ) {
      return null;
    }

    const timezoneItems = [
      {
        label: `${DateTime.local().toFormat("ZZZZ")} (local time)`,
        value: "local",
      },
      { label: "UTC", value: "utc" },
    ];
    const selectedItem = this.props.timezone || timezoneItems[0].value;

    return (
      <Footer>
        <Buttons>
          {this.props.adding ? (
            <LoadingButton>Adding ...</LoadingButton>
          ) : (
            <Button
              disabled={this.props.adding}
              onClick={() => {
                this.handleAddScheduleClick();
              }}
            >
              Add Schedule
            </Button>
          )}
        </Buttons>
        <Timezone>
          <TimezoneLabel>Show all times in</TimezoneLabel>
          <DropdownLink
            items={timezoneItems}
            selectedItem={selectedItem}
            onChange={item => {
              this.props.onTimezoneChange(
                item.value === "utc" ? "utc" : "local"
              );
            }}
          />
        </Timezone>
      </Footer>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderFooter()}
        {this.renderNoSchedules()}
        {this.renderLoading()}
        {this.state.showOptionsModal ? (
          <Modal
            isOpen
            title="Execution options"
            onRequestClose={() => {
              this.handleCloseOptionsModal();
            }}
          >
            <TransferExecutionOptions
              disableExecutionOptions={this.props.disableExecutionOptions}
              options={this.state.executionOptions}
              onChange={(fieldName, value) => {
                this.handleExecutionOptionsChange(fieldName, value);
              }}
              executionLabel="Save"
              onCancelClick={() => {
                this.handleCloseOptionsModal();
              }}
              onExecuteClick={fields => {
                this.handleOptionsSave(fields);
              }}
            />
          </Modal>
        ) : null}
        {this.state.showDeleteConfirmation ? (
          <AlertModal
            isOpen
            title="Delete Schedule?"
            message="Are you sure you want to delete this schedule?"
            extraMessage=" "
            onConfirmation={() => {
              this.handleDeleteConfirmation();
            }}
            onRequestClose={() => {
              this.handleCloseDeleteConfirmation();
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default Schedule;
