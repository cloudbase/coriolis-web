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
import moment from 'moment'

import StatusImage from '../../../../atoms/StatusImage'
import InfoIcon from '../../../../atoms/InfoIcon'

import Palette from '../../../../styleUtils/Palette'
import StyleProps from '../../../../styleUtils/StyleProps'

import type { Licence } from '../../../../../@types/Licence'

const Wrapper = styled.div<any>`
  flex-grow: 1;
`
const Title = styled.div<any>`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 12px;
`
const Module = styled.div<any>`
  background: ${Palette.grayscale[0]};
  display: flex;
  overflow: auto;
  border-radius: ${StyleProps.borderRadius};
  padding: 24px 16px 16px 16px;
  height: 232px;
`
const LicenceInfo = styled.div<any>`
  width: 100%;
`
const NoLicence = styled.div<any>``
const TopInfo = styled.div<any>`
  display: flex;
`
const TopInfoText = styled.div<any>`
  flex-grow: 1;
`
const TopInfoDate = styled.div<any>`
  ${StyleProps.exactWidth('76px')}
  ${StyleProps.exactHeight('80px')}
  display: flex;
  flex-direction: column;
  margin-left: 24px;
  ${StyleProps.boxShadow}
  border-radius: ${StyleProps.borderRadius};
  overflow: hidden;
`
const TopInfoDateTop = styled.div<any>`
  width: 100%;
  height: 27px;
  background: linear-gradient(#007AE7, #0044CA);
  color: white;
  text-align: center;
  line-height: 27px;
`
const TopInfoDateBottom = styled.div<any>`
  background: white;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${Palette.primary};
  font-size: 37px;
  font-weight: ${StyleProps.fontWeights.extraLight};
`
const Charts = styled.div<any>`
  margin-top: -8px;
`
const ChartRow = styled.div`
  display: flex;
  margin-left: -32px;
  margin-top: 32px;
`
const Chart = styled.div<any>`
  width: 100%;
  margin-left: 32px;
`
const ChartHeader = styled.div<any>`
  display: flex;
  justify-content: space-between;
`
const ChartHeaderCurrent = styled.div<any>``
const ChartHeaderTotal = styled.div<any>`
  color: ${Palette.grayscale[4]};
`
const ChartBodyWrapper = styled.div<any>`
  height: 8px;
  background: ${Palette.grayscale[2]};
  border-radius: ${StyleProps.borderRadius};
  margin-top: 4px;
  overflow: hidden;
`
const ChartBody = styled.div<any>`
  width: ${props => props.width}%;
  background: ${props => props.color};
  height: 100%;
`
const LoadingWrapper = styled.div<any>`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

type Props = {
  licence: Licence | null,
  loading: boolean,
  style: any,
  licenceError: string | null,
}
@observer
class LicenceModule extends React.Component<Props> {
  renderExpiration(date: Date) {
    const dateMoment = moment(date)
    const days = dateMoment.diff(new Date(), 'days')
    if (days === 0) {
      return (
        <span>today at <b>{dateMoment.utc().format('HH:mm')} UTC</b></span>
      )
    }
    return (
      <span>on <b>{dateMoment.format('DD MMM YYYY')}</b></span>
    )
  }

  renderLicenceStatusText(info: Licence): React.ReactNode {
    const graphDataRows = [
      [
        {
          color: Palette.alert,
          current: info.currentPerformedReplicas,
          total: info.currentAvailableReplicas,
          label: 'Current Replicas',
          info: 'The number of replicas consumed over the number of replicas available in all currently active licences (including non-activated floating licences)',
        },
        {
          color: Palette.alert,
          current: info.lifetimePerformedReplicas,
          total: info.lifetimeAvailableReplicas,
          label: 'Lifetime Replicas',
          info: 'The number of replicas perfomred over the number of replicas licenced from all licences (including expired licences)',
        },
      ],
      [
        {
          color: Palette.primary,
          current: info.currentPerformedMigrations,
          total: info.currentAvailableMigrations,
          label: 'Current Migrations',
          info: 'The number of migrations consumed over the number of migrations available in all currently active licences (including non-activated floating licences)',
        },
        {
          color: Palette.primary,
          current: info.lifetimePerformedMigrations,
          total: info.lifetimeAvailableMigrations,
          label: 'Lifetime Migrations',
          info: 'The number of migrations performed over the number of migrations licenced from all licences (including expired licences)',
        },
      ],
    ]
    const latestLicenceExpiryDate = moment(info.latestLicenceExpiryDate)
    return (
      <LicenceInfo>
        <TopInfo>
          <TopInfoText>
            Earliest Coriolis® Licence expires&nbsp;
            {this.renderExpiration(info.earliestLicenceExpiryDate)}.<br /><br />
            Latest Coriolis® Licence expires {this.renderExpiration(info.latestLicenceExpiryDate)}.
          </TopInfoText>
          <TopInfoDate>
            <TopInfoDateTop>{latestLicenceExpiryDate.format('MMM')} &#39;{latestLicenceExpiryDate.format('YY')}</TopInfoDateTop>
            <TopInfoDateBottom>{latestLicenceExpiryDate.format('DD')}</TopInfoDateBottom>
          </TopInfoDate>
        </TopInfo>
        <Charts>
          {graphDataRows.map(row => (
            <ChartRow>
              {row.map(data => (
                <Chart key={data.label}>
                  <ChartHeader>
                    <ChartHeaderCurrent>
                      {data.current} {data.label} <InfoIcon marginBottom={-3} text={data.info} />
                    </ChartHeaderCurrent>
                    <ChartHeaderTotal>{data.total}</ChartHeaderTotal>
                  </ChartHeader>
                  <ChartBodyWrapper>
                    <ChartBody color={data.color} width={(data.current / data.total) * 100} />
                  </ChartBodyWrapper>
                </Chart>
              ))}
            </ChartRow>
          ))}
        </Charts>
      </LicenceInfo>
    )
  }

  renderNoLicence() {
    const message = this.props.licenceError || 'Please contact Cloudbase Solutions with your Appliance ID in order to obtain a Coriolis® licence.'
    return (
      <NoLicence>{message}</NoLicence>
    )
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage status="RUNNING" />
      </LoadingWrapper>
    )
  }

  render() {
    const licence = this.props.licence
    let moduleContent = null
    if (licence) {
      if (new Date(licence.earliestLicenceExpiryDate).getTime() > new Date().getTime()) {
        moduleContent = this.renderLicenceStatusText(licence)
      } else {
        moduleContent = this.renderNoLicence()
      }
    } else if (this.props.loading) {
      moduleContent = this.renderLoading()
    } else if (this.props.licenceError) {
      moduleContent = this.renderNoLicence()
    }

    return licence || this.props.loading || this.props.licenceError ? (
      <Wrapper style={this.props.style}>
        <Title>Current Licence</Title>
        <Module>
          {moduleContent}
        </Module>
      </Wrapper>
    ) : null
  }
}

export default LicenceModule
