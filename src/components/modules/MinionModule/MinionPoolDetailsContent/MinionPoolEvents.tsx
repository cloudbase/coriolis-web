/*
Copyright (C) 2020  Cloudbase Solutions SRL
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
import styled from "styled-components";

import {
  MinionPoolDetails,
  MinionPoolEventProgressUpdate,
} from "@src/@types/MinionPool";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import InfoIcon from "@src/components/ui/InfoIcon";
import Pagination from "@src/components/ui/Pagination";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import configLoader from "@src/utils/Config";
import DateUtils from "@src/utils/DateUtils";

const Wrapper = styled.div``;
const Filters = styled.div`
  margin-bottom: 24px;
  display: flex;
`;
const FilterDropdownWrapper = styled.div`
  margin-left: 24px;
`;
const EventsTable = styled.div`
  background: ${ThemePalette.grayscale[1]};
  border-radius: ${ThemeProps.borderRadius};
  margin-bottom: 16px;
`;
const Header = styled.div`
  display: flex;
  border-bottom: 1px solid ${ThemePalette.grayscale[5]};
  padding: 4px 8px;
`;
type DataDivProps = {
  width?: string;
  grow?: boolean;
  secondary?: boolean;
};
const HeaderData = styled.div<DataDivProps>`
  ${props => (props.width ? ThemeProps.exactWidth(props.width) : "")}
  ${props => (props.grow ? "flex-grow: 1;" : "")}
  font-size: 10px;
  color: ${ThemePalette.grayscale[5]};
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
`;
const Body = styled.div``;
const Row = styled.div`
  display: flex;
  padding: 8px;
  border-bottom: 1px solid white;
`;
const RowData = styled.div<DataDivProps>`
  ${props => (props.width ? ThemeProps.exactWidth(props.width) : "")}
  ${props => (props.grow ? "flex-grow: 1;" : "")}
  ${props => (props.secondary ? `color: ${ThemePalette.grayscale[4]};` : "")}
`;
const Message = styled.pre`
  font-family: inherit;
  white-space: pre-line;
  margin: inherit;
`;
const NoData = styled.div`
  text-align: center;
`;
type FilterType = "all" | "events" | "progress";
type EventLevel = "DEBUG" | "INFO" | "ERROR";
type OrderDir = "asc" | "desc";
type Props = {
  item?: MinionPoolDetails | null;
};

type State = {
  allEvents: MinionPoolEventProgressUpdate[];
  prevLenghts: number[];
  currentPage: number;
  filterBy: FilterType;
  eventLevel: EventLevel;
  orderDir: OrderDir;
};
class MinionPoolEvents extends React.Component<Props, State> {
  state = {
    allEvents: [] as MinionPoolEventProgressUpdate[],
    prevLenghts: [0, 0],
    currentPage: 1,
    filterBy: "events" as FilterType,
    eventLevel: "INFO" as EventLevel,
    orderDir: "desc" as OrderDir,
  };

  get filteredEventsWithoutPagination() {
    const shouldFilterByEventType = (event: any): boolean => {
      if (this.state.filterBy === "events") {
        return event.level;
      }
      if (this.state.filterBy === "progress") {
        return event.current_step != null;
      }
      return true;
    };
    const shouldFilterByLevel = (event: any): boolean => {
      if (!event.level) {
        return true;
      }
      if (this.state.eventLevel === "INFO") {
        return event.level === "INFO" || event.level === "ERROR";
      }
      if (this.state.eventLevel === "ERROR") {
        return event.level === "ERROR";
      }
      return true;
    };

    return this.state.allEvents
      .filter(
        (event: any) =>
          shouldFilterByEventType(event) && shouldFilterByLevel(event),
      )
      .sort((a: any, b: any) => {
        if (a.index && b.index && this.state.filterBy !== "all") {
          return this.state.orderDir === "asc"
            ? a.index - b.index
            : b.index - a.index;
        }
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return this.state.orderDir === "asc" ? aTime - bTime : bTime - aTime;
      });
  }

  get filteredEvents() {
    return this.filteredEventsWithoutPagination.filter((_, i) => {
      const minI =
        configLoader.config.maxMinionPoolEventsPerPage *
        (this.state.currentPage - 1);
      const maxI = minI + configLoader.config.maxMinionPoolEventsPerPage;
      return i >= minI && i < maxI;
    });
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    if (!props.item) {
      return null;
    }
    const events = props.item?.events || [];
    const progressUpdates = props.item?.progress_updates || [];
    if (
      events.length === state.prevLenghts[0] &&
      progressUpdates.length === state.prevLenghts[1]
    ) {
      return null;
    }

    return {
      allEvents: events.concat(progressUpdates as any),
      prevLenghts: [events.length, progressUpdates.length],
    };
  }

  setOrderDir(orderDir: OrderDir) {
    this.setState({ orderDir, currentPage: 1 });
  }

  filterByType(filterBy: FilterType) {
    this.setState({ filterBy, currentPage: 1 });
  }

  filterByLevel(eventLevel: EventLevel) {
    this.setState({ eventLevel, currentPage: 1 });
  }

  handlePreviousPageClick() {
    this.setState(state => ({ currentPage: state.currentPage - 1 }));
  }

  handleNextPageClick() {
    this.setState(state => ({ currentPage: state.currentPage + 1 }));
  }

  renderHeader() {
    return (
      <Header>
        <HeaderData grow>Event / Progress Update Message</HeaderData>
        <HeaderData width="192px">Timestamp</HeaderData>
      </Header>
    );
  }

  renderBody() {
    return (
      <Body>
        {this.filteredEvents.map((event: any) => {
          let status = "INFO";
          status = event.level || status;
          if (event.level === "DEBUG") {
            status = "WARNING";
          }
          const title = event.current_step ? "Progress Update" : "Event";
          return (
            <Row key={event.id}>
              <RowData
                grow
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "8px",
                }}
              >
                <StatusIcon
                  style={{ marginRight: "8px" }}
                  status={status}
                  title={title}
                  hollow={event.current_step != null}
                />
                <Message>{event.message}</Message>
              </RowData>
              <RowData width="192px" secondary>
                {DateUtils.getLocalDate(event.created_at).toFormat(
                  "yyyy-LL-dd HH:mm:ss",
                )}
              </RowData>
            </Row>
          );
        })}
      </Body>
    );
  }

  renderPagination() {
    if (
      this.filteredEventsWithoutPagination.length <=
      configLoader.config.maxMinionPoolEventsPerPage
    ) {
      return null;
    }
    const totalPages = Math.ceil(
      this.filteredEventsWithoutPagination.length /
        configLoader.config.maxMinionPoolEventsPerPage,
    );
    return (
      <Pagination
        previousDisabled={this.state.currentPage === 1}
        nextDisabled={this.state.currentPage === totalPages}
        onPreviousClick={() => {
          this.handlePreviousPageClick();
        }}
        onNextClick={() => {
          this.handleNextPageClick();
        }}
        currentPage={this.state.currentPage}
        totalPages={totalPages}
      />
    );
  }

  renderEventsTable() {
    return (
      <EventsTable>
        {this.renderHeader()}
        {this.renderBody()}
      </EventsTable>
    );
  }

  renderFilters() {
    return (
      <Filters>
        <FilterDropdownWrapper>
          <DropdownLink
            selectedItem={this.state.filterBy}
            items={[
              { label: "Events", value: "events" },
              { label: "Progress Updates", value: "progress" },
              { label: "Events & Progress Updates", value: "all" },
            ]}
            onChange={item => {
              this.filterByType(item.value as FilterType);
            }}
          />
        </FilterDropdownWrapper>
        <FilterDropdownWrapper
          style={{ opacity: this.state.filterBy === "progress" ? 0.5 : 1 }}
        >
          <DropdownLink
            disabled={this.state.filterBy === "progress"}
            selectedItem={this.state.eventLevel}
            items={[
              { label: "DEBUG Event Level", value: "DEBUG" },
              { label: "INFO Event Level", value: "INFO" },
              { label: "ERROR Event Level", value: "ERROR" },
            ]}
            onChange={item => {
              this.filterByLevel(item.value as EventLevel);
            }}
          />
          <InfoIcon text="The log level only applies to the events. The progress updates are not affected." />
        </FilterDropdownWrapper>
        <FilterDropdownWrapper>
          <DropdownLink
            selectedItem={this.state.orderDir}
            items={[
              { label: "Ascending Order", value: "asc" },
              { label: "Descending Order", value: "desc" },
            ]}
            onChange={item => {
              this.setOrderDir(item.value as OrderDir);
            }}
          />
        </FilterDropdownWrapper>
      </Filters>
    );
  }

  renderNoData() {
    return (
      <NoData>
        There are no events or progress updates associated with this minion
        pool.
      </NoData>
    );
  }

  renderNoDataFound() {
    return <NoData>No events found</NoData>;
  }

  render() {
    const isNoData = this.state.allEvents.length === 0;
    const isNoDataFound = this.filteredEvents.length === 0;
    return (
      <Wrapper>
        {!isNoData ? this.renderFilters() : null}
        {!isNoData && !isNoDataFound ? this.renderEventsTable() : null}
        {!isNoData && !isNoDataFound ? this.renderPagination() : null}
        {isNoData ? this.renderNoData() : null}
        {isNoDataFound && !isNoData ? this.renderNoDataFound() : null}
      </Wrapper>
    );
  }
}

export default MinionPoolEvents;
