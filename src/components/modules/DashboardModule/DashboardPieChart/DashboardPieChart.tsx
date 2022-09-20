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
import autobind from "autobind-decorator";
import { ThemeProps } from "@src/components/Theme";

const Wrapper = styled.div<any>`
  position: relative;
  display: flex;
`;
const OuterShadow = styled.div<any>`
  position: absolute;
  top: 0;
  left: 0;
  ${props => ThemeProps.exactSize(`${props.size}px`)}
  border-radius: 50%;
  ${ThemeProps.boxShadow}
  pointer-events: none;
`;
const InnerShadow = styled.div<any>`
  position: absolute;
  top: calc(50% - ${props => props.size}px);
  left: calc(50% - ${props => props.size}px);
  ${props => ThemeProps.exactSize(`${props.size * 2}px`)}
  border-radius: 50%;
  box-shadow: inset rgba(0, 0, 0, 0.1) 0 0 6px 2px;
  pointer-events: none;
`;
const Canvas = styled.canvas``;

export type DataItem = { value: number; [prop: string]: any };
type Props = {
  size: number;
  data: any[];
  holeStyle?: {
    radius: number;
    color: string;
  };
  colors: string[];
  onMouseOver?: (item: DataItem, positionX: number, positionY: number) => void;
  onMouseLeave?: () => void;
  customRef?: (ref: HTMLElement) => void;
};

@observer
class DashboardPieChart extends React.Component<Props> {
  canvas: HTMLCanvasElement | null | undefined;

  angles: number[] = [];

  topData: DataItem[] = [];

  sum = 0;

  componentDidMount() {
    this.drawChart();
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mouseleave", this.handleMouseLeave);
  }

  UNSAFE_componentWillReceiveProps() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  componentWillUnmount() {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }
    canvas.removeEventListener("mousemove", this.handleMouseMove);
    canvas.removeEventListener("mouseleave", this.handleMouseLeave);
  }

  @autobind
  handleMouseMove(evt: MouseEvent) {
    const canvas = this.canvas;
    const onMouseOver = this.props.onMouseOver;
    if (!canvas || !onMouseOver) {
      return;
    }
    const mouseX = evt.offsetX;
    const mouseY = evt.offsetY;
    const item = this.detectHit(mouseX * 2, mouseY * 2);
    if (item) {
      onMouseOver(item, mouseX, mouseY);
    } else if (this.props.onMouseLeave) {
      this.props.onMouseLeave();
    }
  }

  @autobind
  handleMouseLeave() {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave();
    }
  }

  drawChart() {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }
    canvas.style.width = `${this.props.size}px`;
    canvas.style.height = `${this.props.size}px`;

    this.topData = this.props.data
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    this.sum = this.topData.reduce((total, item) => total + item.value, 0);
    if (this.sum === 0) {
      this.angles = this.topData.map(
        () => Math.PI * ((1 / this.topData.length) * 2)
      );
    } else {
      this.angles = this.topData.map(
        item => Math.PI * ((item.value / this.sum) * 2)
      );
    }
    const halfSize = this.props.size / 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.props.size * 2, this.props.size * 2);
    ctx.scale(2, 2);
    let beginAngle = Math.PI;
    let endAngle = Math.PI;
    for (let i = 0; i < this.angles.length; i += 1) {
      beginAngle = endAngle;
      endAngle += this.angles[i];

      ctx.beginPath();
      ctx.fillStyle = this.props.colors[i % this.props.colors.length];
      ctx.moveTo(halfSize, halfSize);
      ctx.arc(halfSize, halfSize, halfSize, beginAngle, endAngle);
      ctx.fill();
    }
    const holeStyle = this.props.holeStyle;
    if (!holeStyle) {
      return;
    }
    ctx.beginPath();
    ctx.fillStyle = holeStyle.color;
    ctx.moveTo(halfSize, halfSize);
    ctx.arc(halfSize, halfSize, holeStyle.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  detectHit(x: number, y: number): any {
    const canvas = this.canvas;
    if (!canvas) {
      return null;
    }

    const halfSize = this.props.size / 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }
    const holeStyle = this.props.holeStyle;
    if (holeStyle) {
      ctx.beginPath();
      ctx.moveTo(halfSize, halfSize);
      ctx.arc(halfSize, halfSize, holeStyle.radius, 0, 2 * Math.PI);
      if (ctx.isPointInPath(x, y)) {
        return null;
      }
    }

    let beginAngle = Math.PI;
    let endAngle = Math.PI;
    for (let i = 0; i < this.angles.length; i += 1) {
      beginAngle = endAngle;
      endAngle += this.angles[i];

      ctx.beginPath();
      ctx.moveTo(halfSize, halfSize);
      ctx.arc(halfSize, halfSize, halfSize, beginAngle, endAngle);
      if (ctx.isPointInPath(x, y)) {
        return this.topData[i];
      }
    }
    return null;
  }

  render() {
    return (
      <Wrapper
        ref={(ref: HTMLElement) => {
          if (this.props.customRef) this.props.customRef(ref);
        }}
      >
        <Canvas
          width={this.props.size * 2}
          height={this.props.size * 2}
          ref={ref => {
            this.canvas = ref;
          }}
        />
        <OuterShadow size={this.props.size} />
        {this.props.holeStyle ? (
          <InnerShadow size={this.props.holeStyle.radius} />
        ) : null}
      </Wrapper>
    );
  }
}

export default DashboardPieChart;
