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

export type Licence = {
  applianceId: string;
  earliestLicenceExpiryDate: Date;
  latestLicenceExpiryDate: Date;
  currentPerformedMigrations: number;
  currentPerformedReplicas: number;
  lifetimePerformedMigrations: number;
  lifetimePerformedReplicas: number;
  currentAvailableMigrations: number;
  currentAvailableReplicas: number;
  lifetimeAvailableMigrations: number;
  lifetimeAvailableReplicas: number;
};

export type LicenceServerStatus = {
  hostname: string;
  multi_appliance: boolean;
  supported_licence_versions: string[];
  server_local_time: string;
};
