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

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.scss';
import UserIcon from '../UserIcon';
import NotificationIcon from '../NotificationIcon';
import Link from '../Link';
import Location from '../../core/Location';

class Header extends Component {
  static propTypes = {
    title: PropTypes.string,
    linkUrl: PropTypes.string
  }
  static defaultProps = {
    title: "Coriolis",
    linkUrl: "/migrations/"
  }

  constructor(props) {
    super(props)
    this.state = {
      menuOpen: false,
      windowHeight: '0'
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({ height: window.innerHeight })
  }

  goToMenu(location) {
    this.setState({ menuOpen: false })
    Location.push(location)
  }

  toggleMenu() {
    this.setState({ menuOpen: !this.state.menuOpen })
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div
            onClick={(e) => this.toggleMenu(e)}
            className={s.menuIcon + (this.state.menuOpen ? " open" : "")}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <Link className={s.brand} to={this.props.linkUrl}>
            <div className="logo coriolis-white-topbar"></div>
          </Link>
          <div className={s.banner}>
            {/*<h1 className={s.bannerTitle}>{this.props.title}</h1>*/}
          </div>
          <div className={s.userIcon}>
            <UserIcon dark={true} />
            <NotificationIcon dark={true} />
          </div>
        </div>
        <div
          className={s.sideMenu + (this.state.menuOpen ? " open" : "")}
          style={{ height: this.state.height }}
        >
          <ul>
            <li><a onClick={(e) => this.goToMenu("/replicas")}>Replicas</a></li>
            <li><a onClick={(e) => this.goToMenu("/migrations")}>Migrations</a></li>
            <li><a onClick={(e) => this.goToMenu("/cloud-endpoints")}>Cloud Endpoints</a></li>
            <li><a onClick={(e) => this.goToMenu("/projects")}>Projects</a></li>
          </ul>
        </div>
      </div>
    );
  }

}

export default withStyles(Header, s);
