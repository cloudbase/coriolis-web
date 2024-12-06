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

import { DateTime, Duration } from "luxon";
import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import { TransferItem } from "@src/@types/MainItem";
import DashboardBarChart from "@src/components/modules/DashboardModule/DashboardBarChart";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import DateUtils from "@src/utils/DateUtils";

import emptyBackgroundImage from "./images/empty-background.svg";

const INTERVALS = [
  { label: "Last {x} days", value: "30-days" },
  { label: "Last 12 months", value: "1-years" },
];

const Wrapper = styled.div<any>``;
const Title = styled.div<any>`
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  margin-bottom: 12px;
`;
const Module = styled.div<any>`
  position: relative;
  display: flex;
  background: ${ThemePalette.grayscale[0]};
  border-radius: ${ThemeProps.borderRadius};
  height: 240px;
`;
const ChartWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;
const BarChartWrapper = styled.div<any>`
  display: flex;
  height: 100%;
  width: 100%;
`;
const LoadingWrapper = styled.div<any>`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;
const DropdownWrapper = styled.div<any>`
  display: flex;
  justify-content: flex-end;
  margin: 16px;
`;
const Tooltip = styled.div<any>`
  position: absolute;
  bottom: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  background: ${ThemePalette.black};
  padding: 8px 16px 16px 16px;
  border-radius: ${ThemeProps.borderRadius};
  color: white;
  ${ThemeProps.exactWidth("174px")}
  box-shadow: rgba(0,0,0,0.1) 0 0 6px 1px;
`;
const TooltipHeader = styled.div<any>`
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  text-align: center;
  border-bottom: 1px solid;
  padding-bottom: 4px;
`;
const TooltipBody = styled.div<any>`
  font-size: 12px;
`;
const TooltipRow = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;
const TooltipRowLabel = styled.div<any>``;
const TooltipTip = styled.div<any>`
  position: absolute;
  width: 16px;
  height: 16px;
  bottom: -8px;
  background: ${ThemePalette.black};
  left: calc(50% - 16px);
  transform: rotate(45deg);
`;
const NoData = styled.div<any>`
  padding: 0 16px;
  position: relative;
`;
const NoDataMessage = styled.div<any>`
  position: absolute;
  font-size: 17px;
  color: ${ThemePalette.grayscale[4]};
  display: flex;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  text-shadow: rgba(255, 255, 255, 1) 0px 0px 20px;
`;
const EmptyBackgroundImage = styled.div<any>`
  width: 100%;
  height: 146px;
  background: url("${emptyBackgroundImage}");
`;

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  replicas: TransferItem[];
  migrations: TransferItem[];
  loading: boolean;
};
type GroupedData = {
  label: string;
  values: number[];
  data?: string
};
type TooltipData = {
  title: string;
  migrations: number;
  replicas: number;
};
type State = {
  selectedPeriod: string;
  groupedData: GroupedData[];
  tooltipPosition: { x: number; y: number };
  tooltipData: TooltipData | null;
};
const COLORS = [ThemePalette.alert, ThemePalette.primary];

@observer
class DashboardExecutions extends React.Component<Props, State> {
  state: State = {
    selectedPeriod: INTERVALS[0].value,
    groupedData: [],
    tooltipData: null,
    tooltipPosition: { x: 0, y: 0 },
  };

  componentDidMount() {
    this.groupCreations(this.props);
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.groupCreations(props);
  }

  groupCreations(props: Props) {
    let creations: TransferItem[] = [...props.replicas, ...props.migrations];

    const periodUnit: any = this.state.selectedPeriod.split("-")[1];
    const periodValue: any = Number(this.state.selectedPeriod.split("-")[0]);
    const oldestDate: Date = DateTime.local()
      .minus(Duration.fromObject({ [periodUnit]: periodValue }))
      .toJSDate();
    creations = creations.filter(
      e => new Date(e.created_at).getTime() >= oldestDate.getTime()
    );
    creations.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    this.groupByPeriod(creations, periodUnit);
  }

  groupByPeriod(transferItems: TransferItem[], periodUnit: string) {
    const groupedData: GroupedData[] = [];
    const periods: {
      [period: string]: { replicas: number; migrations: number };
    } = {};
    transferItems.forEach(item => {
      const date = DateUtils.getUtcDate(item.created_at);
      const period: string =
        periodUnit === "days"
          ? date.toFormat("dd-LLL-yyyy_dd LLLL")
          : date.toFormat("LLL-yyyy_LLLL yyyy");

      if (!periods[period]) {
        periods[period] = { replicas: 0, migrations: 0 };
      }
      if (item.scenario === "replica") {
        periods[period].replicas += 1;
      } else if (item.scenario === "live_migration") {
        periods[period].migrations += 1;
      }
    });
    Object.keys(periods).forEach(period => {
      if (!periods[period].replicas && !periods[period].migrations) {
        return;
      }
      const label = period.split("_")[0];
      const title = period.split("_")[1];
      groupedData.push({
        label:
          periodUnit === "days"
            ? `${label.split("-")[0]} ${label.split("-")[1]}`
            : label.split("-")[0],
        values: [periods[period].migrations, periods[period].replicas],
        data: title,
      });
    });
    this.setState({ groupedData });
  }

  handleDropdownChange(selectedPeriod: string) {
    this.setState({ selectedPeriod }, () => {
      this.groupCreations(this.props);
    });
  }

  handleBarMouseEnter(position: { x: number; y: number }, item: GroupedData) {
    this.setState({
      tooltipPosition: { x: position.x - 86, y: position.y },
      tooltipData: {
        replicas: item.values[1],
        migrations: item.values[0],
        title: item.data || "-",
      },
    });
  }

  handleBarMouseLeave() {
    this.setState({ tooltipData: null });
  }

  renderDropdown() {
    const items = INTERVALS.map(interval => ({
      value: interval.value,
      label: interval.label.replace("{x}", interval.value.split("-")[0]),
    }));
    const selectedItem = INTERVALS.find(
      i => i.value === this.state.selectedPeriod
    );
    return (
      <DropdownWrapper>
        <DropdownLink
          items={items}
          selectedItem={selectedItem && selectedItem.value}
          onChange={item => {
            this.handleDropdownChange(item.value);
          }}
        />
      </DropdownWrapper>
    );
  }

  renderTooltip() {
    const data = this.state.tooltipData;
    if (!data) {
      return null;
    }
    return (
      <Tooltip position={this.state.tooltipPosition}>
        <TooltipHeader>{data.title}</TooltipHeader>
        <TooltipBody>
          <TooltipRow>
            <TooltipRowLabel>Created</TooltipRowLabel>
            <TooltipRowLabel>{data.replicas + data.migrations}</TooltipRowLabel>
          </TooltipRow>
          <TooltipRow>
            <TooltipRowLabel>Replicas</TooltipRowLabel>
            <TooltipRowLabel>{data.replicas}</TooltipRowLabel>
          </TooltipRow>
          <TooltipRow>
            <TooltipRowLabel>Migrations</TooltipRowLabel>
            <TooltipRowLabel>{data.migrations}</TooltipRowLabel>
          </TooltipRow>
        </TooltipBody>
        <TooltipTip />
      </Tooltip>
    );
  }

  renderBarChart() {
    return (
      <BarChartWrapper>
        <DashboardBarChart
          style={{ height: "164px" }}
          yNumTicks={3}
          data={this.state.groupedData}
          colors={COLORS}
          onBarMouseEnter={(position, item) => {
            this.handleBarMouseEnter(position, item);
          }}
          onBarMouseLeave={() => {
            this.handleBarMouseLeave();
          }}
        />
        {this.renderTooltip()}
      </BarChartWrapper>
    );
  }

  renderChart() {
    return (
      <ChartWrapper>
        {this.renderDropdown()}
        {this.state.groupedData.length
          ? this.renderBarChart()
          : this.renderNoData()}
      </ChartWrapper>
    );
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage status="RUNNING" />
      </LoadingWrapper>
    );
  }

  renderNoData() {
    return (
      <NoData>
        <EmptyBackgroundImage />
        <NoDataMessage>No recent activity in this project</NoDataMessage>
      </NoData>
    );
  }

  render() {
    return (
      <Wrapper>
        <Title>Items Created</Title>
        <Module>
          {this.props.replicas.length === 0 && this.props.loading
            ? this.renderLoading()
            : this.renderChart()}
        </Module>
      </Wrapper>
    );
  }
}

export default DashboardExecutions;
