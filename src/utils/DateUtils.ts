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

import moment from "moment";

class DateUtils {
  static getLocalTime(rawDate: moment.MomentInput): moment.Moment {
    const usableRawDate = rawDate || undefined;
    return moment(usableRawDate).add(
      -new Date().getTimezoneOffset(),
      "minutes"
    );
  }

  static getUtcTime(rawDate: moment.MomentInput): moment.Moment {
    const usableRawDate = rawDate || undefined;
    return moment(usableRawDate).add(new Date().getTimezoneOffset(), "minutes");
  }

  static getLocalHour(hour: number): number {
    return moment("00", "HH")
      .add(-new Date().getTimezoneOffset(), "minutes")
      .add(hour, "hours")
      .get("hours");
  }

  static getUtcHour(hour: number): number {
    return moment("00", "HH")
      .add(new Date().getTimezoneOffset(), "minutes")
      .add(hour, "hours")
      .get("hours");
  }

  static getOrdinalDay(number: number) {
    switch (number) {
      case 1:
      case 21:
        return `${number}st`;
      case 2:
      case 22:
        return `${number}nd`;
      case 3:
      case 23:
        return `${number}rd`;
      default:
        return `${number}th`;
    }
  }

  static toUnix(date: Date): number {
    return parseInt((date.getTime() / 1000).toFixed(0), 10);
  }
}

export default DateUtils;
