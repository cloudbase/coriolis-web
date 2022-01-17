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

import StatusImage from '@src/components/ui/StatusComponents/StatusImage'
import InfoIcon from '@src/components/ui/InfoIcon'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import type { Licence, LicenceServerStatus } from '@src/@types/Licence'
import CopyValue from '@src/components/ui/CopyValue'
import Button from '@src/components/ui/Button'

import licenceImage from '@src/components/modules/LicenceModule/images/licence'

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
  display: flex;
  overflow: auto;
  border-radius: ${ThemeProps.borderRadius};
  padding: 24px 16px 16px 16px;
  height: 232px;
`
const LicenceInfo = styled.div<any>`
  width: 100%;
`
const LicenceError = styled.span`
  p {
    margin: 16px 0 0 0;
    &:first-child {
      margin: 0;
    }
  }
`
const ApplianceId = styled.div`
  display: flex;
  margin-top: 16px;
`
const AddLicenceButtonWrapper = styled.div`
  margin-top: 32px;
  text-align: center;
`
const TopInfo = styled.div<any>`
  display: flex;
`
const TopInfoText = styled.div<any>`
  flex-grow: 1;
`
const TopInfoDate = styled.div<any>`
  ${ThemeProps.exactWidth('76px')}
  ${ThemeProps.exactHeight('80px')}
  display: flex;
  flex-direction: column;
  margin-left: 24px;
  ${ThemeProps.boxShadow}
  border-radius: ${ThemeProps.borderRadius};
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
  color: ${ThemePalette.primary};
  font-size: 37px;
  font-weight: ${ThemeProps.fontWeights.extraLight};
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
  color: ${ThemePalette.grayscale[4]};
`
const ChartBodyWrapper = styled.div<any>`
  height: 8px;
  background: ${ThemePalette.grayscale[2]};
  border-radius: ${ThemeProps.borderRadius};
  margin-top: 4px;
  overflow: hidden;
`
const ChartBody = styled.div<any>`
  width: ${props => props.width}%;
  background: ${props => props.color};
  height: 100%;
`
const Logo = styled.div`
  width: 96px;
  height: 96px;
  margin: 0 auto;
  transform: scale(0.7);
  text-align: center;
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
  licenceServerStatus: LicenceServerStatus | null
  loading: boolean,
  style: any,
  licenceError: string | null,
  onAddClick: () => void,
}
@observer
class DashboardLicence extends React.Component<Props> {
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
          color: ThemePalette.alert,
          current: info.currentPerformedReplicas,
          total: info.currentAvailableReplicas,
          label: 'Current Replicas',
          info: `The number of replicas consumed over the number of replicas available in
          all currently active licences (including non-activated floating licences)`,
        },
        {
          color: ThemePalette.alert,
          current: info.lifetimePerformedReplicas,
          total: info.lifetimeAvailableReplicas,
          label: 'Lifetime Replicas',
          info: 'The number of replicas performed over the number of replicas licenced from all licences (including expired licences)',
        },
      ],
      [
        {
          color: ThemePalette.primary,
          current: info.currentPerformedMigrations,
          total: info.currentAvailableMigrations,
          label: 'Current Migrations',
          info: `The number of migrations consumed over the number of migrations available in
          all currently active licences (including non-activated floating licences)`,
        },
        {
          color: ThemePalette.primary,
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

  renderLicenceError() {
    return (
      <LicenceError>{this.props.licenceError?.split('\n').map(str => <p>{str}</p>)}</LicenceError>
    )
  }

  renderLicenceExpired(licence: Licence, serverStatus: LicenceServerStatus) {
    const applianceId = `${licence.applianceId}-licence${serverStatus.supported_licence_versions[0]}`
    const applianceLabel = applianceId.replace(/(.*-.*-)(.*-.*)(-.*-.*)/, '$1...$3')
    return (
      <LicenceError>
        <p>
          Please contact Cloudbase Solutions with your Appliance ID
          in order to obtain a Coriolis® licence.
        </p>
        <ApplianceId>
          Appliance ID: <CopyValue
            style={{ marginLeft: '8px' }}
            value={applianceId}
            label={applianceLabel}
          />
        </ApplianceId>
        <AddLicenceButtonWrapper>
          <Logo
            dangerouslySetInnerHTML={
              { __html: licenceImage(ThemePalette.grayscale[5]) }
            }
          />
          <Button primary onClick={this.props.onAddClick}>Add Licence</Button>
        </AddLicenceButtonWrapper>
      </LicenceError>
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
    if (licence && this.props.licenceServerStatus) {
      if (new Date(licence.earliestLicenceExpiryDate).getTime() > new Date().getTime()) {
        moduleContent = this.renderLicenceStatusText(licence)
      } else {
        moduleContent = this.renderLicenceExpired(licence, this.props.licenceServerStatus)
      }
    } else if (this.props.loading) {
      moduleContent = this.renderLoading()
    } else if (this.props.licenceError) {
      moduleContent = this.renderLicenceError()
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

export default DashboardLicence
