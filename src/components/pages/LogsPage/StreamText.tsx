/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import styled, { createGlobalStyle } from 'styled-components'
import { observer } from 'mobx-react'
import AnsiToHtml from 'ansi-to-html'

import DropdownLink from '../../molecules/DropdownLink'
import Checkbox from '../../atoms/Checkbox'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import type { Log } from '../../../@types/Log'

import expandImage from './images/expand.svg'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-grow: 1;
`
const Header = styled.div<any>`
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-bottom: 8px;
  align-items: center;
`
const DropdownLinkStyled = styled(DropdownLink)`
  margin-left: 16px;
`
const OpenInNewWindow = styled.a`
  ${StyleProps.exactSize('14px')}
  background: url('${expandImage}') center no-repeat;
  background-size: contain;
  cursor: pointer;
  margin-left: 24px;
`
const Content = styled.div<any>`
  padding: 8px;
  border-top-left-radius: ${StyleProps.borderRadius};
  border-top-right-radius: ${StyleProps.borderRadius};
  border: 1px solid #DCE1EB;
  background: #F5F6FA;
  font-family: 'Courier New', Courier, monospace;
  overflow: auto;
  flex-grow: 1;
`
const Footer = styled.div<any>`
  padding: 8px;
  border-bottom-left-radius: ${StyleProps.borderRadius};
  border-bottom-right-radius: ${StyleProps.borderRadius};
  border: 1px solid #DCE1EB;
  border-top: none;
  display: flex;
  flex-shrink: 0;
`
const AutoscrollLabel = styled.div<any>`
  margin-left: 8px;
  cursor: pointer;
`
const FeedLine = styled.div<any>`
  word-break: break-word;
`
const TextButton = styled.div<any>`
  color: ${Palette.grayscale[3]};
  cursor: pointer;
  margin-right: 16px;
  transition: all ${StyleProps.animations.swift};
  &:hover {
    color: ${Palette.primary};
  }
`
const ERROR_COLOR = '#c80546'
const INFO_COLOR = '#747474'
const WARNING_COLOR = '#cb9002'
const GlobalStyle = createGlobalStyle`
  .streamTextPill-EMERGENCY { color: ${ERROR_COLOR}; }
  .streamTextPill-ALERT { color: ${ERROR_COLOR}; }
  .streamTextPill-CRITICAL { color: ${ERROR_COLOR}; }
  .streamTextPill-ERROR { color: ${ERROR_COLOR}; }
  .streamTextPill-WARNING { color: ${WARNING_COLOR}; }
  .streamTextPill-NOTICE { color: ${WARNING_COLOR}; }
  .streamTextPill-INFO { color: ${INFO_COLOR}; }
  .streamTextPill-DEBUG { color: ${WARNING_COLOR}; }
`
const SEVERITY_LEVELS = [
  { value: 0, label: 'Emergency' },
  { value: 1, label: 'Alert' },
  { value: 2, label: 'Critical' },
  { value: 3, label: 'Error' },
  { value: 4, label: 'Warning' },
  { value: 5, label: 'Notice' },
  { value: 6, label: 'Informational' },
  { value: 7, label: 'Debug' },
]
type Props = {
  liveFeed: string[],
  logs: Log[],
  logName: string,
  severityLevel: number,
  onLogNameChange: (logName: string) => void,
  onSeverityLevelChange: (level: number) => void,
  disableOpenInNewWindow?: boolean,
  stopPlayLabel: string,
  onStopPlayClick: () => void,
  onClearClick: () => void,
}
type State = {
  autoscroll: boolean,
}
@observer
class StreamText extends React.Component<Props, State> {
  state: State = {
    autoscroll: true,
  }

  ansiConverter: any

  contentRef!: HTMLElement

  UNSAFE_componentWillMount() {
    this.ansiConverter = new AnsiToHtml()
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate(prevProps: Props) {
    const firstFeedOldKey = prevProps.liveFeed.length && prevProps.liveFeed[0].substr(0, 23)
    const fristFeedNewKey = this.props.liveFeed.length && this.props.liveFeed[0].substr(0, 23)
    const lastFeedOldKey = prevProps.liveFeed.length
      && prevProps.liveFeed[prevProps.liveFeed.length - 1].substr(0, 23)
    const lastFeedNewKey = this.props.liveFeed.length
      && this.props.liveFeed[this.props.liveFeed.length - 1].substr(0, 23)

    if ((firstFeedOldKey !== fristFeedNewKey || lastFeedOldKey !== lastFeedNewKey
      || prevProps.liveFeed.length !== this.props.liveFeed.length)
      && this.state.autoscroll) {
      this.scrollToBottom()
    }
  }

  scrollToBottom() {
    this.contentRef.scrollTop = this.contentRef.scrollHeight
  }

  handleScroll() {
    const scrollTopTotal = this.contentRef.scrollTop + this.contentRef.offsetHeight
    const scrollTopMax = this.contentRef.scrollHeight
    if (scrollTopTotal < scrollTopMax - 50) {
      this.setState({ autoscroll: false })
    }
  }

  handleAutoscrollChange(autoscroll: boolean) {
    this.setState({ autoscroll })
    if (autoscroll) {
      this.scrollToBottom()
    }
  }

  render() {
    return (
      <Wrapper>
        <GlobalStyle />
        <Header>
          <TextButton onClick={this.props.onStopPlayClick}>{this.props.stopPlayLabel}</TextButton>
          <TextButton onClick={this.props.onClearClick}>Clear</TextButton>
          <DropdownLinkStyled
            items={SEVERITY_LEVELS}
            selectedItem={this.props.severityLevel}
            onChange={item => { this.props.onSeverityLevelChange(Number(item.value)) }}
          />
          <DropdownLinkStyled
            items={this.props.logs.map(l => ({ label: l.log_name, value: l.log_name }))}
            selectedItem={this.props.logName}
            onChange={item => { this.props.onLogNameChange(String(item.value)) }}
          />
          {!this.props.disableOpenInNewWindow ? (
            <OpenInNewWindow
              href={`streamlog?logName=${this.props.logName}&severity=${this.props.severityLevel}`}
              target="_blank"
            />
          ) : null}
        </Header>
        <Content
          ref={(ref: HTMLElement) => { this.contentRef = ref }}
          onScroll={() => { this.handleScroll() }}
        >
          {this.props.liveFeed.map(feed => {
            const exp = /(^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) (.*?)\s/gm
            const newFeed = feed.replace(exp, '$1 <span class="streamTextPill-$2">$2</span> ').replace(/\n/g, '<br />')
            return (
              <FeedLine
                key={newFeed}
                dangerouslySetInnerHTML={{
                  __html: this.ansiConverter.toHtml(newFeed).replace(/(?:<b>|<\/b>)/g, ''),
                }}
              />
            )
          })}
        </Content>
        <Footer>
          <Checkbox
            checked={this.state.autoscroll}
            onChange={val => { this.handleAutoscrollChange(val) }}
          />
          <AutoscrollLabel onClick={() => {
            this.handleAutoscrollChange(!this.state.autoscroll)
          }}
          >
            Autoscroll with output
          </AutoscrollLabel>
        </Footer>
      </Wrapper>
    )
  }
}

export default StreamText
