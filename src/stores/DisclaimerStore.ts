/*
Copyright (C) 2025  Cloudbase Solutions SRL
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

import { observable, action, runInAction } from "mobx";

import source from "@src/sources/DisclaimerSource";

class DisclaimerStore {
  @observable disclaimer = "";

  @observable loadingDisclaimer = false;

  @observable loadingDisclaimerError = "";

  @action async loadDisclaimer() {
    this.loadingDisclaimer = true;
    try {
      const disclaimer = await source.loadDisclaimer();
      runInAction(() => {
        this.disclaimer = disclaimer;
        this.loadingDisclaimerError = "";
      });
    } catch (err) {
      runInAction(() => {
        this.loadingDisclaimerError =
          err.data?.error?.message || err.message || "";
      });
    } finally {
      runInAction(() => {
        this.loadingDisclaimer = false;
      });
    }
  }
}

export default new DisclaimerStore();
