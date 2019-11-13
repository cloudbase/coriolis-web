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

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import StreamText from '../LogsPage/StreamText'

import logStore from '../../../stores/LogStore'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
`

type State = {
  logName: string,
  severityLevel: number,
  isStreaming: boolean,
}
@observer
class LogStreamPage extends React.Component<{}, State> {
  state = {
    logName: 'All Logs',
    severityLevel: 6,
    isStreaming: true,
  }

  componentWillMount() {
    let logName = 'All Logs'
    let severityLevel = 6

    let logNameExp = /logName=(.*?)(?:&|$)/
    let severityExp = /severity=(.*?)(?:&|$)/
    let logNameMatch = logNameExp.exec(window.location.hash) || logNameExp.exec(window.location.search)
    let severityMatch = severityExp.exec(window.location.hash) || severityExp.exec(window.location.search)

    if (logNameMatch) {
      logName = decodeURIComponent(logNameMatch[1])
    }
    if (severityMatch) {
      severityLevel = Number(severityMatch[1])
    }

    this.setState({ logName, severityLevel })

    logStore.getLogs({ showLoading: logStore.logs.length === 0 })
    logStore.startLiveFeed({ logName, severityLevel })
  }

  componentDidMount() {
    document.title = 'Coriolis Logs Stream'
  }

  componentWillUnmount() {
    logStore.stopLiveFeed()
    logStore.clearLiveFeed()
  }

  handleClearClick() {
    logStore.clearLiveFeed()
  }

  handleStopPlayClick() {
    if (this.state.isStreaming) {
      logStore.stopLiveFeed()
    } else {
      logStore.startLiveFeed({ logName: this.state.logName, severityLevel: this.state.severityLevel })
    }

    this.setState({ isStreaming: !this.state.isStreaming })
  }

  handleLogNameChange(logName: string) {
    this.setState({ logName })
    logStore.stopLiveFeed()
    logStore.startLiveFeed({
      logName,
      severityLevel: this.state.severityLevel,
    })
  }

  handleSeverityLevelChange(severityLevel: number) {
    this.setState({ severityLevel })
    logStore.stopLiveFeed()
    logStore.startLiveFeed({
      logName: this.state.logName,
      severityLevel,
    })
  }

  render() {
    return (
      <Wrapper>
        <StreamText
          logName={this.state.logName}
          logs={[{ log_name: 'All Logs' }, ...logStore.logs]}
          severityLevel={this.state.severityLevel}
          liveFeed={logStore.liveFeed}
          onLogNameChange={logName => { this.handleLogNameChange(logName) }}
          onSeverityLevelChange={level => { this.handleSeverityLevelChange(level) }}
          disableOpenInNewWindow
          onClearClick={() => { this.handleClearClick() }}
          stopPlayLabel={this.state.isStreaming ? 'Stop' : 'Start'}
          onStopPlayClick={() => { this.handleStopPlayClick() }}
        />
      </Wrapper>
    )
  }
}

export default LogStreamPage
