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

import autobind from "autobind-decorator";
import { DateTime } from "luxon";
import { observer } from "mobx-react";
import React from "react";
import Datetime from "react-datetime";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";

import { ThemeProps } from "@src/components/Theme";
import DropdownButton from "@src/components/ui/Dropdowns/DropdownButton";
import DateUtils from "@src/utils/DateUtils";
import DomUtils from "@src/utils/DomUtils";

import style from "./style";

const GlobalStyle = createGlobalStyle`${style}`;

const Wrapper = styled.div<any>`
  width: ${ThemeProps.inputSizes.regular.width}px;
`;
const DropdownButtonStyled = styled(DropdownButton)`
  font-size: 12px;
`;
const Portal = styled.div<any>`
  position: absolute;
  z-index: 10;
  &.hideTip {
    .rdtPicker:after {
      content: none;
    }
  }
`;
const DatetimeStyled = styled(Datetime)<any>`
  ${ThemeProps.boxShadow}
`;

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  isValidDate?: (currentDate: Date, selectedDate?: Date) => boolean;
  timezone: "utc" | "local";
  useBold?: boolean;
  dispatchChangeContinously?: boolean;
};
type State = {
  showPicker: boolean;
  date: DateTime | null;
};
@observer
class DatetimePicker extends React.Component<Props, State> {
  state: State = {
    showPicker: false,
    date: null,
  };

  itemMouseDown: boolean | undefined;

  portalRef: HTMLElement | undefined | null;

  buttonRef: HTMLElement | undefined | null;

  scrollableParent: HTMLElement | undefined | null;

  UNSAFE_componentWillMount() {
    if (this.props.value) {
      this.setState({
        date: DateUtils.getLocalDate(this.props.value),
      });
    }
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.handlePageClick, false);
    if (this.buttonRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.buttonRef);
      this.scrollableParent.addEventListener("scroll", this.handleScroll);
    }
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.value?.getTime() !== this.props.value?.getTime()) {
      this.setState({
        date: newProps.value && DateUtils.getLocalDate(newProps.value),
      });
    }
  }

  componentDidUpdate() {
    this.setPortalPosition();
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handlePageClick, false);
    if (this.scrollableParent) {
      this.scrollableParent.removeEventListener(
        "scroll",
        this.handleScroll,
        false
      );
    }
  }

  setPortalPosition() {
    if (!this.portalRef || !this.buttonRef) {
      return;
    }

    const buttonRect = this.buttonRef.getBoundingClientRect();
    const leftOffset =
      buttonRect.left - (this.portalRef.offsetWidth - buttonRect.width) + 10;
    const tipHeight = 12;
    let topOffset = buttonRect.top + this.buttonRef.offsetHeight + tipHeight;
    const listHeight = this.portalRef.offsetHeight;

    if (topOffset + listHeight > window.innerHeight) {
      topOffset = window.innerHeight - listHeight - 16;
      this.portalRef.classList.add("hideTip");
    } else {
      this.portalRef.classList.remove("hideTip");
    }

    this.portalRef.style.top = `${topOffset + window.pageYOffset}px`;
    this.portalRef.style.left = `${leftOffset + window.pageXOffset}px`;
  }

  isValidDate(currentDate: Date, selectedDate?: Date): boolean {
    if (!this.props.isValidDate) {
      return true;
    }

    return this.props.isValidDate(currentDate, selectedDate);
  }

  @autobind
  handleScroll() {
    if (this.buttonRef) {
      if (DomUtils.isElementInViewport(this.buttonRef, this.scrollableParent)) {
        this.setPortalPosition();
      } else if (this.state.showPicker) {
        this.setState({ showPicker: false });
      }
    }
  }

  @autobind
  handlePageClick(e: Event) {
    const path = DomUtils.getEventPath(e);

    if (!this.itemMouseDown && !path.find(n => n.className === "rdtPicker")) {
      this.dispatchChange();
      this.setState({ showPicker: false });
    }
  }

  handleDropdownClick() {
    this.dispatchChange();
    this.setState(prevState => ({ showPicker: !prevState.showPicker }));
  }

  handleChange(newDate: Date) {
    let date = DateUtils.getLocalDate(newDate);
    if (this.props.timezone === "utc") {
      date = date.setZone("utc");
    }

    this.setState({ date }, () => {
      if (this.props.dispatchChangeContinously) {
        this.dispatchChange();
      }
    });
  }

  dispatchChange() {
    if (
      this.state.date &&
      this.state.showPicker &&
      this.state.date.valueOf() !==
        (this.props.value && this.props.value.valueOf())
    ) {
      this.props.onChange(this.state.date.toJSDate());
    }
  }

  renderDateTimePicker(timezoneDate: DateTime | null) {
    if (!this.state.showPicker) {
      return null;
    }

    const { body } = document;
    return ReactDOM.createPortal(
      <Portal
        ref={(e: HTMLElement | null | undefined) => {
          this.portalRef = e;
        }}
      >
        <DatetimeStyled
          input={false}
          value={timezoneDate?.toJSDate()}
          style={{ top: 0, right: 0 }}
          onChange={(date: any) => {
            if (date) {
              this.handleChange(date.toDate());
            }
          }}
          dateFormat="DD/MM/YYYY"
          timeFormat="hh:mm A"
          locale="en-gb"
          isValidDate={(currentDate: any, selectedDate: any) =>
            this.isValidDate(currentDate.toDate(), selectedDate?.toDate())
          }
        />
      </Portal>,
      body
    );
  }

  render() {
    let timezoneDate = this.state.date;
    if (this.props.timezone === "utc" && timezoneDate) {
      timezoneDate = timezoneDate.setZone("utc");
    }

    return (
      <>
        <GlobalStyle />
        <Wrapper>
          <DropdownButtonStyled
            customRef={e => {
              this.buttonRef = e;
            }}
            width={207}
            value={
              timezoneDate ? timezoneDate.toFormat("dd/LL/yyyy hh:mm a") : "-"
            }
            centered
            useBold={this.props.useBold}
            onClick={() => {
              this.handleDropdownClick();
            }}
            onMouseDown={() => {
              this.itemMouseDown = true;
            }}
            onMouseUp={() => {
              this.itemMouseDown = false;
            }}
          />
          {this.renderDateTimePicker(timezoneDate)}
        </Wrapper>
      </>
    );
  }
}

export default DatetimePicker;
