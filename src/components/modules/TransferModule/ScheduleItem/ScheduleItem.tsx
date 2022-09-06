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
import styled, { css } from "styled-components";
import moment from "moment";

import Switch from "@src/components/ui/Switch";
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import DatetimePicker from "@src/components/ui/DatetimePicker";
import Button from "@src/components/ui/Button";
import type { Schedule, ScheduleFieldName } from "@src/@types/Schedule";

import { executionOptions } from "@src/constants";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import DateUtils from "@src/utils/DateUtils";
import notificationStore from "@src/stores/NotificationStore";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import deleteImage from "./images/delete.svg";
import deleteHoverImage from "./images/delete-hover.svg";
import saveImage from "./images/save.svg";
import saveHoverImage from "./images/save-hover.svg";

const Wrapper = styled.div<any>`
  display: flex;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  padding: 16px 0;
  position: relative;
  &:last-child {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const EnablingIcon = styled.div`
  position: absolute;
  top: 24px;
  left: 8px;
`;
const Data = styled.div<any>`
  width: ${props => props.width};
`;
const Label = styled.div<any>`
  background: ${ThemePalette.grayscale[7]};
  height: 100%;
  font-size: 12px;
  margin-right: 8px;
  border-radius: ${ThemeProps.borderRadius};
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 35px;
  margin-bottom: -8px;
`;
const DropdownStyled = styled(Dropdown)`
  font-size: 12px;
`;
const ItemButton = (props: any) => css`
  width: 16px;
  height: 16px;
  position: absolute;
  cursor: pointer;
  top: 24px;
  ${props.hidden ? "display: none;" : ""}
`;
const DeleteButton = styled.div<any>`
  ${props => ItemButton(props)}
  background: url('${deleteImage}') center no-repeat;
  right: -32px;

  &:hover {
    background: url("${deleteHoverImage}") center no-repeat;
  }
`;
const SaveButton = styled.div<any>`
  ${props => ItemButton(props)}
  background: url('${saveImage}') center no-repeat;
  right: -64px;
  &:hover {
    background: url("${saveHoverImage}") center no-repeat;
  }
`;
const SavingIcon = styled.div`
  position: absolute;
  right: -64px;
  top: 24px;
`;
const DeletingIcon = styled.div`
  position: absolute;
  right: -32px;
  top: 24px;
`;
const padNumber = (number: number) => {
  if (number < 10) return `0${number}`;
  return number.toString();
};

type Field = { label: string; value?: any };
type TimezoneValue = "utc" | "local";
type Props = {
  colWidths: string[];
  item: Schedule;
  onChange: (schedule: Schedule, forced?: boolean) => void;
  onSaveSchedule: () => void;
  onShowOptionsClick: () => void;
  onDeleteClick: () => void;
  unsavedSchedules: Schedule[];
  timezone: TimezoneValue;
  saving: boolean;
  enabling: boolean;
  deleting: boolean;
};
@observer
class ScheduleItem extends React.Component<Props> {
  getFieldValue(opts: {
    items: Field[];
    fieldName: ScheduleFieldName;
    zeroBasedIndex?: boolean;
    defaultSelectedIndex?: number;
  }) {
    const { items, fieldName, zeroBasedIndex, defaultSelectedIndex } = opts;
    if (this.props.item.schedule == null) {
      return defaultSelectedIndex !== undefined
        ? items[defaultSelectedIndex]
        : items[0];
    }

    if (this.props.item.schedule[fieldName] == null) {
      return items[0];
    }

    if (zeroBasedIndex) {
      let value = this.props.item.schedule[fieldName] || 0;

      if (fieldName === "hour" && this.props.timezone === "local") {
        value = DateUtils.getLocalHour(value);
      }

      return items[value + 1];
    }

    return items[this.props.item.schedule[fieldName] || 0];
  }

  handleMonthChange(item: Field) {
    const month = item.value || 1;
    const maxNumDays = moment()
      .month(month - 1)
      .daysInMonth();
    const change: Schedule = { schedule: { month: item.value } };
    if (
      this.props.item.schedule &&
      this.props.item.schedule.dom &&
      change.schedule &&
      this.props.item.schedule.dom > maxNumDays
    ) {
      change.schedule.dom = maxNumDays;
    }

    this.props.onChange(change);
  }

  handleExpirationDateChange(date: Date) {
    const newDate = moment(date);
    if (newDate.diff(new Date(), "minutes") < 60) {
      notificationStore.alert(
        "Please select a further expiration date.",
        "error"
      );
      return;
    }

    this.props.onChange({ expiration_date: newDate.toDate() });
  }

  handleHourChange(hour: number) {
    let usableHour = hour;
    if (this.props.timezone === "local" && usableHour != null) {
      usableHour = DateUtils.getUtcHour(usableHour);
    }

    this.props.onChange({ schedule: { hour: usableHour } });
  }

  shouldUseBold(fieldName: string, isRootField?: boolean) {
    const unsavedSchedule = this.props.unsavedSchedules.find(
      s => s.id === this.props.item.id
    );
    if (!unsavedSchedule) {
      return false;
    }
    const data: any = isRootField ? unsavedSchedule : unsavedSchedule.schedule;
    if (data && data[fieldName] !== undefined) {
      return true;
    }
    return false;
  }

  areExecutionOptionsChanged() {
    let isChanged = false;
    executionOptions.forEach(o => {
      const usableItem: any = this.props.item;
      const scheduleValue = usableItem[o.name];
      const optionValue = o.defaultValue !== undefined ? o.defaultValue : false;
      if (scheduleValue != null && scheduleValue !== optionValue) {
        isChanged = true;
      }
    });
    return isChanged;
  }

  renderLabel(value: Field) {
    return <Label>{value.label}</Label>;
  }

  renderMonthValue() {
    const items: any = [{ label: "Any", value: null }];
    const months = moment.months();
    months.forEach((label, value) => {
      items.push({ label, value: value + 1 });
    });

    if (this.props.item.enabled || this.props.deleting) {
      return this.renderLabel(
        this.getFieldValue({ items, fieldName: "month" })
      );
    }

    return (
      <DropdownStyled
        centered
        width={160}
        items={items}
        useBold={this.shouldUseBold("month")}
        selectedItem={this.getFieldValue({ items, fieldName: "month" })}
        onChange={item => {
          this.handleMonthChange(item);
        }}
      />
    );
  }

  renderDayOfMonthValue() {
    const month =
      this.props.item.schedule && this.props.item.schedule.month
        ? this.props.item.schedule.month
        : 1;
    const items: any = [{ label: "Any", value: null }];
    for (
      let i = 1;
      i <=
      moment()
        .month(month - 1)
        .daysInMonth();
      i += 1
    ) {
      items.push({ label: i.toString(), value: i });
    }

    if (this.props.item.enabled || this.props.deleting) {
      return this.renderLabel(this.getFieldValue({ items, fieldName: "dom" }));
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold("dom")}
        selectedItem={this.getFieldValue({ items, fieldName: "dom" })}
        onChange={item => {
          this.props.onChange({ schedule: { dom: item.value } });
        }}
      />
    );
  }

  renderDayOfWeekValue() {
    const items: any = [{ label: "Any", value: null }];

    const days = moment.weekdays(true);
    days.forEach((label, value) => {
      items.push({ label, value });
    });

    if (this.props.item.enabled || this.props.deleting) {
      return this.renderLabel(
        this.getFieldValue({ items, fieldName: "dow", zeroBasedIndex: true })
      );
    }

    return (
      <DropdownStyled
        centered
        width={160}
        items={items}
        useBold={this.shouldUseBold("dow")}
        selectedItem={this.getFieldValue({
          items,
          fieldName: "dow",
          zeroBasedIndex: true,
        })}
        onChange={item => {
          this.props.onChange({ schedule: { dow: item.value } });
        }}
      />
    );
  }

  renderHourValue() {
    const items: any = [{ label: "Any", value: null }];
    for (let i = 0; i <= 23; i += 1) {
      items.push({ label: padNumber(i), value: i });
    }

    if (this.props.item.enabled || this.props.deleting) {
      return this.renderLabel(
        this.getFieldValue({
          items,
          fieldName: "hour",
          zeroBasedIndex: true,
          defaultSelectedIndex: 1,
        })
      );
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold("hour")}
        selectedItem={this.getFieldValue({
          items,
          fieldName: "hour",
          zeroBasedIndex: true,
          defaultSelectedIndex: 1,
        })}
        onChange={item => {
          this.handleHourChange(item.value);
        }}
      />
    );
  }

  renderMinuteValue() {
    const items: any = [{ label: "Any", value: null }];
    for (let i = 0; i <= 59; i += 1) {
      items.push({ label: padNumber(i), value: i });
    }

    if (this.props.item.enabled || this.props.deleting) {
      return this.renderLabel(
        this.getFieldValue({
          items,
          fieldName: "minute",
          zeroBasedIndex: true,
          defaultSelectedIndex: 1,
        })
      );
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold("minute")}
        selectedItem={this.getFieldValue({
          items,
          fieldName: "minute",
          zeroBasedIndex: true,
          defaultSelectedIndex: 1,
        })}
        onChange={item => {
          this.props.onChange({ schedule: { minute: item.value } });
        }}
      />
    );
  }

  renderExpirationValue() {
    const date =
      this.props.item.expiration_date &&
      moment(this.props.item.expiration_date);

    if (this.props.item.enabled || this.props.deleting) {
      let labelDate = date;
      if (this.props.timezone === "utc" && date) {
        labelDate = DateUtils.getUtcTime(date);
      }
      return this.renderLabel({
        label: (labelDate && labelDate.format("DD/MM/YYYY hh:mm A")) || "-",
      });
    }

    return (
      <DatetimePicker
        value={date ? date.toDate() : null}
        timezone={this.props.timezone}
        useBold={this.shouldUseBold("expiration_date", true)}
        onChange={newDate => {
          this.handleExpirationDateChange(newDate);
        }}
        isValidDate={newDate => moment(newDate).isAfter(moment())}
      />
    );
  }

  render() {
    const enabled =
      typeof this.props.item.enabled !== "undefined" &&
      this.props.item.enabled !== null
        ? this.props.item.enabled
        : false;
    return (
      <Wrapper>
        <Data width={this.props.colWidths[0]}>
          {this.props.enabling ? (
            <EnablingIcon>
              <StatusIcon status="RUNNING" />
            </EnablingIcon>
          ) : (
            <Switch
              noLabel
              height={16}
              disabled={this.props.deleting}
              checked={enabled}
              onChange={itemEnabled => {
                this.props.onChange({ enabled: itemEnabled }, true);
              }}
            />
          )}
        </Data>
        <Data width={this.props.colWidths[1]}>{this.renderMonthValue()}</Data>
        <Data width={this.props.colWidths[2]}>
          {this.renderDayOfMonthValue()}
        </Data>
        <Data width={this.props.colWidths[3]}>
          {this.renderDayOfWeekValue()}
        </Data>
        <Data width={this.props.colWidths[4]}>{this.renderHourValue()}</Data>
        <Data width={this.props.colWidths[5]}>{this.renderMinuteValue()}</Data>
        <Data width={this.props.colWidths[6]}>
          {this.renderExpirationValue()}
        </Data>
        <Data width={this.props.colWidths[7]}>
          <Button
            onClick={this.props.onShowOptionsClick}
            secondary
            hollow={!this.areExecutionOptionsChanged()}
            width="40px"
            style={{
              fontSize: "9px",
              letterSpacing: "1px",
              padding: "0 0 1px 3px",
            }}
          >
            •••
          </Button>
        </Data>
        {this.props.deleting ? (
          <DeletingIcon>
            <StatusIcon status="DELETING" />
          </DeletingIcon>
        ) : (
          <DeleteButton
            onClick={this.props.onDeleteClick}
            hidden={this.props.item.enabled}
          />
        )}
        {this.props.saving && !this.props.enabling ? (
          <SavingIcon>
            <StatusIcon status="RUNNING" />
          </SavingIcon>
        ) : (
          <SaveButton
            onClick={this.props.onSaveSchedule}
            hidden={
              this.props.item.enabled ||
              !this.props.unsavedSchedules.find(
                us => us.id === this.props.item.id
              )
            }
          />
        )}
      </Wrapper>
    );
  }
}

export default ScheduleItem;
