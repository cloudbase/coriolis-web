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

import { Component } from 'react';
import moment from 'moment';
import { cloudLabels, defaultLabels } from '../../constants/CloudLabels';

class Helper extends Component {
  static getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  static generateMigrationName(type) {
    return type + "_" + moment().format("MMDDYY-HHmmss")
  }

  static getTimeObject(rawDate) {
    let offset = (new Date().getTimezoneOffset()) / 60 * -1;

    return moment(rawDate).add(offset, 'hours')
  }

  static toAsterisk(password) {
    let hiddenPass = ""
    for (let i = 0; i++; i < password.length) {
      hiddenPass = hiddenPass + "*"
    }
    return hiddenPass
  }

  static convertCloudFieldLabel(label) {
    return defaultLabels[label] || label
  }

  static convertCloudLabel(label) {
    return cloudLabels[label] || label
  }
}

export default Helper;
