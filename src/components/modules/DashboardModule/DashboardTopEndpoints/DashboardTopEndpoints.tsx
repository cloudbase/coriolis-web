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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import Button from '@src/components/ui/Button/Button'
import StatusImage from '@src/components/ui/StatusComponents/StatusImage/StatusImage'
import EndpointLogos from '@src/components/modules/EndpointModule/EndpointLogos/EndpointLogos'
import DashboardPieChart from '@src/components/modules/DashboardModule/DashboardPieChart/DashboardPieChart'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import type { Endpoint } from '@src/@types/Endpoint'

import { ReplicaItem, MigrationItem, TransferItem } from '@src/@types/MainItem'
import endpointImage from './images/endpoint.svg'

const Wrapper = styled.div<any>`
  flex-grow: 1;
`
const Title = styled.div<any>`
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  margin-bottom: 12px;
`
const Module = styled.div<any>`
  background: ${ThemePalette.grayscale[0]};
  border-radius: ${ThemeProps.borderRadius};
  height: 224px;
  padding: 32px 16px 16px 16px;
`
const ChartWrapper = styled.div<any>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`
const LoadingWrapper = styled.div<any>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`
const Tooltip = styled.div<any>`
  position: absolute;
  width: 208px;
  overflow: hidden;
  border-radius: ${ThemeProps.borderRadius};
  box-shadow: rgba(0,0,0,0.1) 0 0 6px 1px;
`
const TooltipHeader = styled.div<any>`
  background: ${ThemePalette.grayscale[3]};
  height: 24px;
  display: flex;
  align-items: center;
  color: white;
  padding: 0 14px;
`
const TooltipBody = styled.div<any>`
  background: ${ThemePalette.black};
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`
const TooltipRows = styled.div<any>`
  color: white;
  font-size: 10px;
`
const TooltipRow = styled.div<any>``
const Legend = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-left: -8px;
  width: 100%;
`
const LegendItem = styled.div<any>`
  display: flex;
  margin-top: 24px;
  margin-left: 8px;
  width: calc(33% - 8px);
`
const LegendBullet = styled.div<any>`
  ${ThemeProps.exactSize('8px')}
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
const NoItems = styled.div<any>`
  margin-top: -32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const EndpointImage = styled.div<any>`
  ${ThemeProps.exactSize('148px')}
  background: url('${endpointImage}') center no-repeat;
`
const Message = styled.div<any>`
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
  replicas: ReplicaItem[],
  // eslint-disable-next-line react/no-unused-prop-types
  migrations: MigrationItem[],
  // eslint-disable-next-line react/no-unused-prop-types
  endpoints: Endpoint[],
  style: any,
  loading: boolean,
  onNewClick: () => void,
}
type State = {
  tooltipPosition: { x: number, y: number },
  groupedEndpoint: GroupedEndpoint | null,
  groupedEndpoints: GroupedEndpoint[],
}
const COLORS = ['#280E4C', '#FF2D55', '#FDC02F', '#0044CA', '#39DA55', '#A4AAB5']
@observer
class DashboardTopEndpoints extends React.Component<Props, State> {
  state: State = {
    tooltipPosition: { x: 0, y: 0 },
    groupedEndpoint: null,
    groupedEndpoints: [],
  }

  chartRef: HTMLElement | null | undefined

  UNSAFE_componentWillMount() {
    this.calculateGroupedEndpoints(this.props)
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.calculateGroupedEndpoints(props)
  }

  calculateGroupedEndpoints(props: Props) {
    const groupedEndpoints: GroupedEndpoint[] = []
    const count = (mainItems: TransferItem[], endpointId: string) => mainItems
      .filter(r => r.destination_endpoint_id === endpointId
        || r.origin_endpoint_id === endpointId).length

    props.endpoints.forEach(endpoint => {
      const replicasCount = count(props.replicas, endpoint.id)
      const migrationsCount = count(props.migrations, endpoint.id)
      groupedEndpoints.push({
        endpoint, replicasCount, migrationsCount, value: replicasCount + migrationsCount,
      })
    })
    this.setState({ groupedEndpoints })
  }

  handleMouseOver(item: Partial<GroupedEndpoint>, x: number, y: number) {
    if (!this.chartRef) {
      return
    }
    const canvasCoord = { x, y }
    const chartBaseCoord = { x: this.chartRef.offsetLeft, y: this.chartRef.offsetTop }
    const offset = { x: x > 70 ? -224 : 16, y: -32 }
    const tooltipPosition = {
      x: canvasCoord.x + chartBaseCoord.x + offset.x,
      y: canvasCoord.y + chartBaseCoord.y + offset.y,
    }
    this.setState({
      groupedEndpoint: item as GroupedEndpoint,
      tooltipPosition,
    })
  }

  handleMouseLeave() {
    this.setState({ groupedEndpoint: null })
  }

  renderLegend() {
    const topData = this.state.groupedEndpoints.sort((a, b) => b.value - a.value).slice(0, 6)
    return (
      <Legend>
        {topData.map((item, i) => (
          <LegendItem key={item.endpoint.id}>
            <LegendBullet color={COLORS[i % COLORS.length]} />
            <LegendLabel to={`/endpoints/${item.endpoint.id}`}>{item.endpoint.name}</LegendLabel>
          </LegendItem>
        ))}
      </Legend>
    )
  }

  renderTooltip() {
    const groupedEndpoint = this.state.groupedEndpoint
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
        <DashboardPieChart
          customRef={ref => { this.chartRef = ref }}
          size={144}
          data={this.state.groupedEndpoints}
          colors={COLORS}
          holeStyle={{ radius: 57, color: ThemePalette.grayscale[0] }}
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
          {this.props.loading && this.props.endpoints.length === 0
            ? this.renderLoading() : this.props.endpoints.length
              ? this.renderChart() : this.renderNoData()}
        </Module>
      </Wrapper>
    )
  }
}

export default DashboardTopEndpoints
