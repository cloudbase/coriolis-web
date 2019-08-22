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
import moment from 'moment'

import StatusImage from '../../../../atoms/StatusImage'
import DropdownLink from '../../../../molecules/DropdownLink'
import BarChart from '../../charts/BarChart'

import Palette from '../../../../styleUtils/Palette'
import StyleProps from '../../../../styleUtils/StyleProps'

import type { MainItem } from '../../../../../types/MainItem'
import type { Execution } from '../../../../../types/Execution'

import emptyBackgroundImage from './images/empty-background.svg'

const INTERVALS = [
  { label: 'Last {x} days', value: '30-days' },
  { label: 'Last 12 months', value: '1-years' },
]

const Wrapper = styled.div``
const Title = styled.div`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 12px;
`
const Module = styled.div`
  position: relative;
  display: flex;
  background: ${Palette.grayscale[0]};
  border-radius: ${StyleProps.borderRadius};
  height: 240px;
`
const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`
const BarChartWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`
const LoadingWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`
const DropdownWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 16px;
`
const Tooltip = styled.div`
  position: absolute;
  bottom: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  background: ${Palette.black};
  padding: 8px 16px 16px 16px;
  border-radius: ${StyleProps.borderRadius};
  color: white;
  ${StyleProps.exactWidth('174px')}
  box-shadow: rgba(0,0,0,0.1) 0 0 6px 1px;
`
const TooltipHeader = styled.div`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  text-align: center;
  border-bottom: 1px solid;
  padding-bottom: 4px;
`
const TooltipBody = styled.div`
  font-size: 12px;
`
const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`
const TooltipRowLabel = styled.div``
const TooltipTip = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  bottom: -8px;
  background: ${Palette.black};
  left: calc(50% - 16px);
  transform: rotate(45deg);
`
const NoData = styled.div`
  padding: 0 16px;
  position: relative;
`
const NoDataMessage = styled.div`
  position: absolute;
  font-size: 17px;
  color: ${Palette.grayscale[4]};
  display: flex;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  text-shadow: rgba(255,255,255,1) 0px 0px 20px;
`
const EmptyBackgroundImage = styled.div`
  width: 100%;
  height: 146px;
  background: url('${emptyBackgroundImage}');
`

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  replicas: MainItem[],
  loading: boolean,
}
type GroupedData = {
  label: string,
  values: number[],
  data?: string,
}
type TooltipData = {
  title: string,
  success: number,
  failed: number,
}
type State = {
  selectedPeriod: string,
  groupedData: GroupedData[],
  tooltipPosition: { x: number, y: number },
  tooltipData: ?TooltipData,
}
const COLORS = ['#0044CA', '#2D74FF']

@observer
class ExecutionsModule extends React.Component<Props, State> {
  state = {
    selectedPeriod: INTERVALS[0].value,
    groupedData: [],
    tooltipData: null,
    tooltipPosition: { x: 0, y: 0 },
  }

  componentWillMount() {
    this.groupExecutions(this.props)
  }

  componentWillReceiveProps(props: Props) {
    this.groupExecutions(props)
  }

  groupExecutions(props: Props) {
    let executions: Execution[] = []
    let replicas = props.replicas
    replicas.forEach(replica => {
      executions = [...executions, ...replica.executions]
    })
    let periodUnit = this.state.selectedPeriod.split('-')[1]
    let periodValue = Number(this.state.selectedPeriod.split('-')[0])
    let oldestDate: Date = moment().subtract(periodValue, periodUnit).toDate()
    executions = executions.filter(e => new Date(e.updated_at || e.created_at).getTime() >= oldestDate.getTime())
    executions.sort((a, b) => new Date(a.updated_at || a.created_at).getTime() -
      new Date(b.updated_at || b.created_at).getTime())
    this.groupByPeriod(executions, periodUnit)
  }

  groupByPeriod(executions: Execution[], periodUnit: string) {
    let groupedData: GroupedData[] = []
    let periods: { [period: string]: { success: number, failed: number } } = {}
    executions.forEach(e => {
      let date = moment(new Date(e.updated_at || e.created_at))
      let period: string = periodUnit === 'days' ? date.format('DD-MMM-YYYY_DD MMMM') : date.format('MMM-YYYY_MMMM YYYY')
      if (!periods[period]) {
        periods[period] = { success: 0, failed: 0 }
      }
      if (e.status === 'COMPLETED') {
        periods[period].success += 1
      } else if (e.status === 'ERROR') {
        periods[period].failed += 1
      }
    })
    Object.keys(periods).forEach(period => {
      if (!periods[period].success && !periods[period].failed) {
        return
      }
      let label = period.split('_')[0]
      let title = period.split('_')[1]
      groupedData.push({
        label: periodUnit === 'days' ? `${label.split('-')[0]} ${label.split('-')[1]}` : label.split('-')[0],
        values: [periods[period].failed, periods[period].success],
        data: title,
      })
    })
    this.setState({ groupedData })
  }

  handleDropdownChange(selectedPeriod: string) {
    this.setState({ selectedPeriod }, () => {
      this.groupExecutions(this.props)
    })
  }

  handleBarMouseEnter(position: { x: number, y: number }, item: GroupedData) {
    this.setState({
      tooltipPosition: { x: position.x - 86, y: position.y },
      tooltipData: {
        failed: item.values[0],
        success: item.values[1],
        title: item.data || '-',
      },
    })
  }

  handleBarMouseLeave() {
    this.setState({ tooltipData: null })
  }

  renderDropdown() {
    let items = INTERVALS.map(interval => {
      return {
        value: interval.value,
        label: interval.label.replace('{x}', interval.value.split('-')[0]),
      }
    })
    let selectedItem = INTERVALS.find(i => i.value === this.state.selectedPeriod)
    return (
      <DropdownWrapper>
        <DropdownLink
          items={items}
          selectedItem={selectedItem && selectedItem.value}
          onChange={item => { this.handleDropdownChange(item.value) }}
        />
      </DropdownWrapper>
    )
  }

  renderTooltip() {
    let data = this.state.tooltipData
    if (!data) {
      return null
    }
    return (
      <Tooltip position={this.state.tooltipPosition}>
        <TooltipHeader>{data.title}</TooltipHeader>
        <TooltipBody>
          <TooltipRow>
            <TooltipRowLabel>Total Executions</TooltipRowLabel>
            <TooltipRowLabel>{data.success + data.failed}</TooltipRowLabel>
          </TooltipRow>
          <TooltipRow>
            <TooltipRowLabel>Successful</TooltipRowLabel>
            <TooltipRowLabel>{data.success}</TooltipRowLabel>
          </TooltipRow>
          <TooltipRow>
            <TooltipRowLabel>Failed</TooltipRowLabel>
            <TooltipRowLabel>{data.failed}</TooltipRowLabel>
          </TooltipRow>
        </TooltipBody>
        <TooltipTip />
      </Tooltip>
    )
  }

  renderBarChart() {
    return (
      <BarChartWrapper>
        <BarChart
          style={{ height: '164px' }}
          yNumTicks={3}
          data={this.state.groupedData}
          colors={COLORS}
          onBarMouseEnter={(position, item) => { this.handleBarMouseEnter(position, item) }}
          onBarMouseLeave={() => { this.handleBarMouseLeave() }}
        />
        {this.renderTooltip()}
      </BarChartWrapper>
    )
  }

  renderChart() {
    return (
      <ChartWrapper>
        {this.renderDropdown()}
        {this.state.groupedData.length ? this.renderBarChart() : this.renderNoData()}
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
      <NoData>
        <EmptyBackgroundImage />
        <NoDataMessage>No recent activity in this project</NoDataMessage>
      </NoData>
    )
  }

  render() {
    return (
      <Wrapper>
        <Title>Replica Executions</Title>
        <Module>
          {this.props.replicas.length === 0 && this.props.loading ? this.renderLoading() : this.renderChart()}
        </Module>
      </Wrapper>
    )
  }
}

export default ExecutionsModule
