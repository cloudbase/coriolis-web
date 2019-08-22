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

// @flow

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import Button from '../../../../atoms/Button'
import StatusImage from '../../../../atoms/StatusImage'
import EndpointLogos from '../../../../atoms/EndpointLogos'
import PieChart from '../../charts/PieChart'

import Palette from '../../../../styleUtils/Palette'
import StyleProps from '../../../../styleUtils/StyleProps'

import type { MainItem } from '../../../../../types/MainItem'
import type { Endpoint } from '../../../../../types/Endpoint'

import endpointImage from './images/endpoint.svg'

const Wrapper = styled.div`
  flex-grow: 1;
`
const Title = styled.div`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 12px;
`
const Module = styled.div`
  background: ${Palette.grayscale[0]};
  border-radius: ${StyleProps.borderRadius};
  height: 224px;
  padding: 32px 16px 16px 16px;
`
const ChartWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`
const LoadingWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`
const Tooltip = styled.div`
  position: absolute;
  width: 208px;
  overflow: hidden;
  border-radius: ${StyleProps.borderRadius};
  box-shadow: rgba(0,0,0,0.1) 0 0 6px 1px;
`
const TooltipHeader = styled.div`
  background: ${Palette.grayscale[3]};
  height: 24px;
  display: flex;
  align-items: center;
  color: white;
  padding: 0 14px;
`
const TooltipBody = styled.div`
  background: ${Palette.black};
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`
const TooltipRows = styled.div`
  color: white;
  font-size: 10px;
`
const TooltipRow = styled.div``
const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -8px;
  width: 100%;
`
const LegendItem = styled.div`
  display: flex;
  margin-top: 24px;
  margin-left: 8px;
  width: calc(33% - 8px);
`
const LegendBullet = styled.div`
  ${StyleProps.exactSize('8px')}
  border: 2px solid ${props => props.color};
  border-radius: 50%;
`
const LegendLabel = styled(Link)`
  display: block;
  font-size: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: 6px;
  text-decoration: none;
  color: inherit;
`
const NoItems = styled.div`
  margin-top: -32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const EndpointImage = styled.div`
  ${StyleProps.exactSize('148px')}
  background: url('${endpointImage}') center no-repeat;
`
const Message = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

type GroupedEndpoint = {
  endpoint: Endpoint,
  replicasCount: number,
  migrationsCount: number,
  value: number,
}
type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  replicas: MainItem[],
  // eslint-disable-next-line react/no-unused-prop-types
  migrations: MainItem[],
  // eslint-disable-next-line react/no-unused-prop-types
  endpoints: Endpoint[],
  style: any,
  loading: boolean,
  onNewClick: () => void,
}
type State = {
  tooltipPosition: { x: number, y: number },
  groupedEndpoint: ?GroupedEndpoint,
  groupedEndpoints: GroupedEndpoint[],
}
const COLORS = ['#280E4C', '#FF2D55', '#FDC02F', '#0044CA', '#39DA55', '#A4AAB5']
@observer
class TopEndpointsModule extends React.Component<Props, State> {
  state = {
    tooltipPosition: { x: 0, y: 0 },
    groupedEndpoint: null,
    groupedEndpoints: [],
  }

  chartRef: HTMLElement

  componentWillMount() {
    this.calculateGroupedEndpoints(this.props)
  }

  componentWillReceiveProps(props: Props) {
    this.calculateGroupedEndpoints(props)
  }

  calculateGroupedEndpoints(props: Props) {
    let groupedEndpoints: GroupedEndpoint[] = []
    let count = (mainItems: MainItem[], endpointId: string) => mainItems.filter(r =>
      r.destination_endpoint_id === endpointId || r.origin_endpoint_id === endpointId).length

    props.endpoints.forEach(endpoint => {
      let replicasCount = count(props.replicas, endpoint.id)
      let migrationsCount = count(props.migrations, endpoint.id)
      groupedEndpoints.push({ endpoint, replicasCount, migrationsCount, value: replicasCount + migrationsCount })
    })
    this.setState({ groupedEndpoints })
  }

  handleMouseOver(item: GroupedEndpoint, x: number, y: number) {
    let canvasCoord = { x, y }
    let chartBaseCoord = { x: this.chartRef.offsetLeft, y: this.chartRef.offsetTop }
    let offset = { x: x > 70 ? -224 : 16, y: -32 }
    let tooltipPosition = { x: canvasCoord.x + chartBaseCoord.x + offset.x, y: canvasCoord.y + chartBaseCoord.y + offset.y }
    this.setState({
      groupedEndpoint: item,
      tooltipPosition,
    })
  }

  handleMouseLeave() {
    this.setState({ groupedEndpoint: null })
  }

  renderLegend() {
    let topData = this.state.groupedEndpoints.sort((a, b) => b.value - a.value).slice(0, 6)
    return (
      <Legend>
        {topData.map((item, i) => (
          <LegendItem key={item.endpoint.id}>
            <LegendBullet color={COLORS[i % COLORS.length]} />
            <LegendLabel to={`/endpoint/${item.endpoint.id}`}>{item.endpoint.name}</LegendLabel>
          </LegendItem>
        ))}
      </Legend>
    )
  }

  renderTooltip() {
    let groupedEndpoint = this.state.groupedEndpoint
    if (!groupedEndpoint) {
      return null
    }

    return (
      <Tooltip style={{ top: this.state.tooltipPosition.y, left: this.state.tooltipPosition.x }}>
        <TooltipHeader>
          {groupedEndpoint.endpoint.name}
        </TooltipHeader>
        <TooltipBody>
          <EndpointLogos white endpoint={groupedEndpoint.endpoint.type} height={32} />
          <TooltipRows>
            <TooltipRow>{groupedEndpoint.replicasCount} Replicas</TooltipRow>
            <TooltipRow>{groupedEndpoint.migrationsCount} Migrations</TooltipRow>
            <TooltipRow>{groupedEndpoint.value} Total</TooltipRow>
          </TooltipRows>
        </TooltipBody>
      </Tooltip>
    )
  }

  renderChart() {
    return (
      <ChartWrapper>
        <PieChart
          customRef={ref => { this.chartRef = ref }}
          size={144}
          data={this.state.groupedEndpoints}
          colors={COLORS}
          holeStyle={{ radius: 57, color: Palette.grayscale[0] }}
          onMouseOver={(item, x, y) => { this.handleMouseOver(item, x, y) }}
          onMouseLeave={() => { this.handleMouseLeave() }}
        />
        {this.renderLegend()}
        {this.renderTooltip()}
      </ChartWrapper>
    )
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage status="RUNNING" />
      </LoadingWrapper>
    )
  }

  renderNoData() {
    return (
      <NoItems>
        <EndpointImage />
        <Message>There are no Cloud Endpoints<br />in this project.</Message>
        <Button hollow primary transparent onClick={this.props.onNewClick}>New Endpoint</Button>
      </NoItems>
    )
  }

  render() {
    return (
      <Wrapper style={this.props.style}>
        <Title>Top Endpoints</Title>
        <Module>
          {this.props.loading && this.props.endpoints.length === 0 ? this.renderLoading() : this.props.endpoints.length ? this.renderChart() : this.renderNoData()}
        </Module>
      </Wrapper>
    )
  }
}

export default TopEndpointsModule
