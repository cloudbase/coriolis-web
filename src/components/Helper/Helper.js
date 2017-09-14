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

  /**
   * Copies specified text to clipboard
   * @param {string} text The text to copy
   * @return True if successful, false otherwise
   */
  static copyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    let successful;

    try {
      successful = document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
      return successful
    }
  }
}

export default Helper;
