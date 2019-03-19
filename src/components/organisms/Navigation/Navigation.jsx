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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import autobind from 'autobind-decorator'

import Logo from '../../atoms/Logo'
import userStore from '../../../stores/UserStore'
import configLoader from '../../../utils/Config'

import { navigationMenu } from '../../../constants'
import backgroundImage from './images/star-bg.jpg'
import cbsImage from './images/cbsl-logo.svg'
import cbsImageSmall from './images/cbsl-logo-small.svg'
import tinyLogo from './images/logo-small.svg'

import replicaImage from './images/replica-menu.svg'
import endpointImage from './images/endpoint-menu.svg'
import planningImage from './images/planning-menu.svg'
import projectImage from './images/project-menu.svg'
import userImage from './images/user-menu.svg'

const MENU_MAX_WIDTH_TOGGLE = 1350

const isCollapsed = (props: any) => props.collapsed || (window.outerWidth < MENU_MAX_WIDTH_TOGGLE)

const ANIMATION = '200ms'

const Wrapper = styled.div`
  background-image: url('${backgroundImage}');
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: ${props => isCollapsed(props) ? '80px' : '320px'};
  transition: width ${ANIMATION};
`

const LogoWrapper = styled.div`
  position: relative;
  height: 48px;
  margin-top: 48px;
  width: 100%;
  display: flex;
  justify-content: center;
`

const LogoStyled = styled(Logo)`
  position: absolute;
  top: 0;
  left: ${props => isCollapsed(props) ? '-9999px' : 'auto'};
  cursor: pointer;
  display: flex;
`

const TinyLogo = styled.a`
  position: absolute;
  top: 0;
  opacity: ${props => isCollapsed(props) ? 1 : 0};
  background: url('${tinyLogo}') center no-repeat;
  display: flex;
  width: 48px;
  height: 48px;
  transition: opacity ${ANIMATION};
`
const MenuWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  margin-top: 32px;
  width: 100%;
`
const Menu = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: ${props => isCollapsed(props) ? '-9999px' : 'auto'};
  opacity: ${props => isCollapsed(props) ? 0 : 1};
  transition: opacity ${ANIMATION};
`

const MenuItem = styled(Link)`
  font-size: 18px;
  color: ${props => props.selected ? '#007AFF' : 'white'};
  cursor: pointer;
  margin-top: 26px;
  text-decoration: none;
  width: 145px;
  margin-left: 32px;
`
const SmallMenu = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  opacity: ${props => isCollapsed(props) ? 1 : 0};
  left: ${props => isCollapsed(props) ? 'auto' : '-9999px'};
  top: 0;
  transition: opacity ${ANIMATION};
`
const SmallMenuBackground = styled.div`
  border-radius: 50%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: background-color ${ANIMATION};
`
const MenuTooltip = styled.div`
  position: absolute;
  font-size: 12px;
  color: #202234;
  background: #D8DBE2;
  border-radius: 8px;
  padding: 1px 6px;
  white-space: nowrap;
  transition: opacity ${ANIMATION};
  opacity: 0;
  left: -9999px;
`
const SmallMenuItem = styled(Link)`
  position: relative;
  cursor: pointer;
  width: 38px;
  height: 38px;
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${SmallMenuBackground} {
    background: ${props => props.selected ? 'white' : 'inherit'}
  }
  &:hover {
    ${SmallMenuBackground} {
      background: white;
    }
    ${MenuTooltip} {
      opacity: 1;
      left: 42px;
    }
  }
`
const SmallMenuItemBullet = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  position: absolute;
  left: -12px;
  background: ${props => props.bullet === 'replica' ? '#E62565' : '#0044CA'};
`

const MenuImage = styled.div`
  width: 24px;
  height: 24px;
  background: url('${props => props.image}') center no-repeat;
`

const Footer = styled.div`
  flex-shrink: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`

const CbsLogoWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 34px;
  justify-content: center;
`
const CbsLogo = styled.a`
  position: absolute;
  top: 0;
  left: ${props => isCollapsed(props) ? '-9999px' : 'auto'};
  opacity: ${props => isCollapsed(props) ? 0 : 1};
  width: 128px;
  height: 34px;
  background: url('${cbsImage}') center no-repeat;
  cursor: pointer;
  display: flex;
  transition: opacity ${ANIMATION};
`
const CbsLogoSmall = styled.a`
  position: absolute;
  top: 0;
  left: ${props => isCollapsed(props) ? 'auto' : '-9999px'};
  opacity: ${props => isCollapsed(props) ? 1 : 0};
  width: 48px;
  height: 34px;
  background: url('${cbsImageSmall}') center no-repeat;
  cursor: pointer;
  display: flex;
  transition: opacity ${ANIMATION};
`
export const TEST_ID = 'navigation'
type Props = {
  currentPage?: string,
  className?: string,
  collapsed?: boolean,
  hideLogos?: boolean,
}

@observer
class Navigation extends React.Component<Props> {
  wrapper: ?HTMLElement
  coriolisLogo: ?HTMLElement
  coriolisLogoSmall: ?HTMLElement
  cbsLogo: ?HTMLElement
  cbsLogoSmall: ?HTMLElement
  menu: ?HTMLElement
  smallMenu: ?HTMLElement

  resizeTimeout: ?TimeoutID

  isCollapsed: boolean = false

  get filteredMenu() {
    const isAdmin = userStore.loggedUser ? userStore.loggedUser.isAdmin : false
    const isDisabled = (page: string) => configLoader.config ? configLoader.config.disabledPages.find(p => p === page) : false
    return navigationMenu.filter(i => !isDisabled(i.value) && (!i.requiresAdmin || isAdmin))
  }

  componentDidMount() {
    if (this.props.collapsed) {
      return
    }
    window.addEventListener('resize', this.handleWindowResize)
  }

  componentWillUnmount() {
    if (this.props.collapsed) {
      return
    }
    window.removeEventListener('resize', this.handleWindowResize)
  }

  @autobind
  handleCollapsedTransitionEnd() {
    if (!this.coriolisLogo || !this.cbsLogo || !this.menu || !this.isCollapsed) {
      return
    }

    this.coriolisLogo.style.left = '-9999px'
    this.cbsLogo.style.left = '-9999px'
    this.menu.style.left = '-9999px'
    this.cbsLogo.removeEventListener('transitionend', this.handleCollapsedTransitionEnd)
  }

  @autobind
  handleExpandedTransitionEnd() {
    if (!this.smallMenu || this.isCollapsed || !this.cbsLogoSmall) {
      return
    }

    this.smallMenu.style.left = '-9999px'
    this.cbsLogoSmall.style.left = '-9999px'
    this.smallMenu.removeEventListener('transitionend', this.handleExpandedTransitionEnd)
  }

  @autobind
  handleWindowResize() {
    if (this.resizeTimeout) {
      return
    }

    this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = null
      this.toggleMenu(window.outerWidth < MENU_MAX_WIDTH_TOGGLE)
    }, 100)
  }

  toggleMenu(toCollapsed: boolean) {
    if (
      !this.wrapper ||
      !this.coriolisLogo ||
      !this.coriolisLogoSmall ||
      !this.cbsLogo ||
      !this.cbsLogoSmall ||
      !this.menu ||
      !this.smallMenu
    ) {
      return
    }

    if (toCollapsed) {
      this.smallMenu.style.left = 'auto'
      this.cbsLogoSmall.style.left = 'auto'
      this.cbsLogo.addEventListener('transitionend', this.handleCollapsedTransitionEnd)
    } else {
      this.coriolisLogo.style.left = 'auto'
      this.cbsLogo.style.left = 'auto'
      this.menu.style.left = 'auto'
      this.smallMenu.addEventListener('transitionend', this.handleExpandedTransitionEnd)
    }
    this.isCollapsed = toCollapsed

    this.wrapper.style.width = toCollapsed ? '80px' : '320px'
    this.coriolisLogoSmall.style.opacity = toCollapsed ? '1' : '0'
    this.coriolisLogo.style.opacity = toCollapsed ? '0' : '1'
    this.cbsLogo.style.opacity = toCollapsed ? '0' : '1'
    this.cbsLogoSmall.style.opacity = toCollapsed ? '1' : '0'
    this.menu.style.opacity = toCollapsed ? '0' : '1'
    this.smallMenu.style.opacity = toCollapsed ? '1' : '0'
  }

  renderMenu() {
    return (
      <Menu innerRef={ref => { this.menu = ref }} collapsed={this.props.collapsed}>
        {
          this.filteredMenu.map(item => {
            return (
              <MenuItem
                key={item.value}
                selected={this.props.currentPage === item.value}
                to={`/${item.value}`}
                data-test-id={`navigation-item-${item.value}`}
              >{item.label}</MenuItem>
            )
          })}
      </Menu>
    )
  }

  renderSmallMenu() {
    return (
      <SmallMenu innerRef={ref => { this.smallMenu = ref }} collapsed={this.props.collapsed}>
        {
          this.filteredMenu.map(item => {
            let menuImage
            let bullet
            switch (item.value) {
              case 'replicas':
                bullet = 'replica'
                menuImage = replicaImage
                break
              case 'migrations':
                bullet = 'migration'
                menuImage = replicaImage
                break
              case 'endpoints':
                menuImage = endpointImage
                break
              case 'planning':
                menuImage = planningImage
                break
              case 'projects':
                menuImage = projectImage
                break
              case 'users':
                menuImage = userImage
                break
              default:
            }

            return (
              <SmallMenuItem
                key={item.value}
                selected={this.props.currentPage === item.value}
                to={`/${item.value}`}
                data-test-id={`${TEST_ID}-smallMenuItem-${item.value}`}
              >
                <SmallMenuBackground />
                {bullet ? <SmallMenuItemBullet bullet={bullet} /> : null}
                <MenuImage image={menuImage} />
                <MenuTooltip>{item.label}</MenuTooltip>
              </SmallMenuItem>
            )
          })}
      </SmallMenu>
    )
  }

  render() {
    return (
      <Wrapper
        innerRef={ref => { this.wrapper = ref }}
        className={this.props.className}
        collapsed={this.props.collapsed}
      >
        {this.props.hideLogos ? null : (
          <LogoWrapper>
            <LogoStyled
              small
              collapsed={this.props.collapsed}
              href={navigationMenu[0].value}
              customRef={ref => { this.coriolisLogo = ref }}
            />
            <TinyLogo
              collapsed={this.props.collapsed}
              innerRef={ref => { this.coriolisLogoSmall = ref }}
              href={navigationMenu[0].value}
            />
          </LogoWrapper>
        )}
        <MenuWrapper>
          {this.renderMenu()}
          {this.renderSmallMenu()}
        </MenuWrapper>
        <Footer>
          {this.props.hideLogos ? null : (
            <CbsLogoWrapper>
              <CbsLogo
                innerRef={ref => { this.cbsLogo = ref }}
                href="https://cloudbase.it"
                target="_blank"
                collapsed={this.props.collapsed}
              />
              <CbsLogoSmall
                innerRef={ref => { this.cbsLogoSmall = ref }}
                href="https://cloudbase.it"
                target="_blank"
                collapsed={this.props.collapsed}
              />
            </CbsLogoWrapper>
          )}
        </Footer>
      </Wrapper>
    )
  }
}

export default Navigation
