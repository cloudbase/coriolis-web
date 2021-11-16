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

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import MainTemplate from '@src/components/modules/TemplateModule/MainTemplate/MainTemplate'
import Navigation from '@src/components/modules/NavigationModule/Navigation/Navigation'
import PageHeader from '@src/components/ui/PageHeader/PageHeader'
import TabNavigation from '@src/components/ui/TabNavigation/TabNavigation'

import logStore from '@src/stores/LogStore'
import notificationStore from '@src/stores/NotificationStore'
import projectStore from '@src/stores/ProjectStore'
import apiLogger from '@src/utils/ApiLogger'
import StreamText from './StreamText'
import DownloadContent from './DownloadsContent'

const TAB_ITEMS = [
  { label: 'Download', value: 'downloads' },
  { label: 'Stream', value: 'stream' },
]

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
`
const TabContent = styled.div<any>`
  display: flex;
  flex-direction: column;
  padding-top: 32px;
  flex-grow: 1;
  min-height: 0;
`

type State = {
  selectedTab: string,
  streamLogName: string,
  streamSeverityLevel: number,
  isStreaming: boolean,
}
@observer
class LogsPage extends React.Component<{}, State> {
  state = {
    selectedTab: 'downloads',
    streamLogName: 'All Logs',
    streamSeverityLevel: 6,
    isStreaming: true,
  }

  UNSAFE_componentWillMount() {
    projectStore.getProjects()
    logStore.getLogs({ showLoading: logStore.logs.length === 0 })
  }

  componentDidMount() {
    document.title = 'Coriolis Logs'
  }

  componentWillUnmount() {
    logStore.stopLiveFeed()
    logStore.clearLiveFeed()
  }

  handleProjectChange() {
    logStore.getLogs({ showLoading: true })
    logStore.stopLiveFeed()
    logStore.clearLiveFeed()
    if (this.state.isStreaming) {
      logStore.startLiveFeed({
        logName: this.state.streamLogName,
        severityLevel: this.state.streamSeverityLevel,
      })
    }
  }

  handleClearClick() {
    logStore.clearLiveFeed()
  }

  handleStopPlayClick() {
    if (this.state.isStreaming) {
      logStore.stopLiveFeed()
    } else {
      logStore.startLiveFeed({
        logName: this.state.streamLogName,
        severityLevel: this.state.streamSeverityLevel,
      })
    }

    this.setState(prevState => ({ isStreaming: !prevState.isStreaming }))
  }

  handleTabChange(selectedTab: string) {
    switch (selectedTab) {
      case 'downloads':
        logStore.getLogs()
        logStore.stopLiveFeed()
        break
      case 'stream':
        logStore.startLiveFeed({
          logName: this.state.streamLogName,
          severityLevel: this.state.streamSeverityLevel,
        })
        break
      default:
        break
    }
    this.setState({ selectedTab })
  }

  handleDownloadClick(logName: string, startDate?: Date | null, endDate?: Date | null) {
    if (logName === '__diagnostics__') {
      logStore.downloadDiagnostics()
      return
    }

    if (logName === '__ui__') {
      apiLogger.download()
      return
    }

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      notificationStore.alert('End time must be greater than start time', 'error')
      return
    }
    logStore.download(logName, startDate, endDate)
  }

  handleStreamLogNameChange(streamLogName: string) {
    this.setState({ streamLogName })
    logStore.stopLiveFeed()
    logStore.startLiveFeed({
      logName: streamLogName,
      severityLevel: this.state.streamSeverityLevel,
    })
  }

  handleSeverityLevelChange(streamSeverityLevel: number) {
    this.setState({ streamSeverityLevel })
    logStore.stopLiveFeed()
    logStore.startLiveFeed({
      logName: this.state.streamLogName,
      severityLevel: streamSeverityLevel,
    })
  }

  renderTabContent() {
    switch (this.state.selectedTab) {
      case 'downloads':
        return (
          <TabContent>
            <DownloadContent
              logs={logStore.logs}
              onDownloadClick={(l, s, e) => { this.handleDownloadClick(l, s, e) }}
              generatingDiagnostics={logStore.generatingDiagnostics}
            />
          </TabContent>
        )
      case 'stream':
        return (
          <TabContent>
            <StreamText
              logName={this.state.streamLogName}
              logs={[{ log_name: 'All Logs' }, ...logStore.logs]}
              severityLevel={this.state.streamSeverityLevel}
              liveFeed={logStore.liveFeed}
              onLogNameChange={logName => { this.handleStreamLogNameChange(logName) }}
              onSeverityLevelChange={level => { this.handleSeverityLevelChange(level) }}
              onClearClick={() => { this.handleClearClick() }}
              stopPlayLabel={this.state.isStreaming ? 'Stop' : 'Start'}
              onStopPlayClick={() => { this.handleStopPlayClick() }}
            />
          </TabContent>
        )
      default:
        return null
    }
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="logging" />}
          listNoMargin
          listComponent={(
            <TabNavigation
              tabItems={TAB_ITEMS}
              onChange={value => { this.handleTabChange(value) }}
              selectedTabValue={this.state.selectedTab}
            >
              {this.renderTabContent()}
            </TabNavigation>
          )}
          headerComponent={(
            <PageHeader
              title="Coriolis Logs"
              onProjectChange={() => { this.handleProjectChange() }}
            />
          )}
        />
      </Wrapper>
    )
  }
}

export default LogsPage
