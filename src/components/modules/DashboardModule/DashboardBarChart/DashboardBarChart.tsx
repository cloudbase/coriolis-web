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

import * as React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import BarChartNiceScale from "./BarChartNiceScale";

const Wrapper = styled.div<any>`
  position: relative;
  width: 100%;
`;
const YAxis = styled.div<any>`
  height: calc(100% - 24px);
  position: absolute;
  bottom: 24px;
  left: 16px;
`;
const YTick = styled.div<any>`
  position: absolute;
  top: ${props => 100 - props.bottom}%;
  font-size: 9px;
  font-weight: ${ThemeProps.fontWeights.medium};
  width: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
`;
const GridLines = styled.div<any>`
  width: calc(100% - 64px);
  height: calc(100% - 24px);
  position: absolute;
  bottom: 19px;
  left: 48px;
`;
const GridLine = styled.div<any>`
  position: absolute;
  bottom: ${props => props.bottom}%;
  height: 1px;
  width: 100%;
  background: white;
`;
const Bars = styled.div<any>`
  position: absolute;
  display: flex;
  height: calc(100% - 6px);
  width: calc(100% - 64px);
  justify-content: space-around;
  left: 48px;
  bottom: 2px;
`;
const Bar = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const StackedBars = styled.div<any>`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
`;
const StackedBar = styled.div<any>`
  width: 16px;
  height: ${props => props.height}%;
  background: ${props => props.background};
  &:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
`;
const BarLabel = styled.div<any>`
  font-size: 9px;
  font-weight: ${ThemeProps.fontWeights.medium};
  margin-top: 8px;
`;
type DataItem = {
  label: string;
  values: number[];
  data?: any;
};
type Props = {
  style?: any;
  data: DataItem[];
  yNumTicks: number;
  colors?: string[];
  onBarMouseEnter?: (
    position: { x: number; y: number },
    item: DataItem,
  ) => void;
  onBarMouseLeave?: () => void;
};

@observer
class DashboardBarChart extends React.Component<Props> {
  barsRef: HTMLElement | null | undefined;

  ticks: { value: number }[] = [];

  range = 1;

  UNSAFE_componentWillMount() {
    this.calculateYTicks(this.props);
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.calculateYTicks(props);
  }

  calculateYTicks(props: Props) {
    this.range = props.data.reduce(
      (max, item) =>
        Math.max(
          max,
          item.values.reduce((sum, value) => sum + value, 0),
        ),
      1,
    );
    const niceScale = new BarChartNiceScale(0, this.range, props.yNumTicks);
    this.ticks = [];
    const numTicks = Math.floor(this.range / niceScale.tickSpacing) + 1;
    for (let i = 0; i < numTicks; i += 1) {
      this.ticks.push({ value: i * niceScale.tickSpacing });
    }
  }

  calculatePosition(evt: MouseEvent): { x: number; y: number } {
    const targetMouse: any = evt.currentTarget;
    const target: HTMLElement = targetMouse.parentElement;
    let height = 0;
    target.childNodes.forEach(node => {
      const element: any = node;
      height += element.offsetHeight;
    });
    return {
      x: target.offsetLeft + 48,
      y: height + 65,
    };
  }

  renderYAxis() {
    return (
      <YAxis>
        {this.ticks.map(tick => (
          <YTick key={tick.value} bottom={(tick.value / this.range) * 100}>
            {tick.value}
          </YTick>
        ))}
      </YAxis>
    );
  }

  renderGridLines() {
    const gridLines: { value: number }[] = [];
    this.ticks.forEach((tick, i) => {
      gridLines.push({ value: tick.value });
      if (i === this.ticks.length - 1) {
        return;
      }
      gridLines.push({ value: (this.ticks[i + 1].value + tick.value) / 2 });
    });
    return (
      <GridLines>
        {gridLines.map(gridline => (
          <GridLine
            key={gridline.value}
            bottom={(gridline.value / this.range) * 100}
          />
        ))}
      </GridLines>
    );
  }

  renderBars() {
    let availableWidth = window.innerWidth;
    if (this.barsRef) {
      availableWidth = this.barsRef.offsetWidth;
    }
    let items = this.props.data;
    if (30 * items.length > availableWidth) {
      items = items.filter((_, i) => i % 2);
    }

    return (
      <Bars
        ref={(ref: HTMLElement | null | undefined) => {
          this.barsRef = ref;
        }}
      >
        {items.map(item => (
          <Bar key={item.label}>
            <StackedBars>
              {[...item.values].reverse().map((value, i) => {
                const height = (value / this.range) * 100;
                return height > 0 ? (
                  <StackedBar
                    key={`${item.label}-${i}`}
                    background={
                      this.props.colors
                        ? this.props.colors[i % this.props.colors.length]
                        : ThemePalette.primary
                    }
                    height={height}
                    onMouseEnter={(evt: MouseEvent) => {
                      const onMouseEnter = this.props.onBarMouseEnter;
                      if (!onMouseEnter) {
                        return;
                      }
                      onMouseEnter(this.calculatePosition(evt), item);
                    }}
                    onMouseLeave={() => {
                      if (this.props.onBarMouseLeave)
                        this.props.onBarMouseLeave();
                    }}
                  />
                ) : null;
              })}
            </StackedBars>
            <BarLabel>{item.label}</BarLabel>
          </Bar>
        ))}
      </Bars>
    );
  }

  render() {
    return (
      <Wrapper style={this.props.style}>
        {this.renderYAxis()}
        {this.renderGridLines()}
        {this.renderBars()}
      </Wrapper>
    );
  }
}

export default DashboardBarChart;
