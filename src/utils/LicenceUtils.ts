/*
Copyright (C) 2026  Cloudbase Solutions SRL
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

import {
  LICENCE_VERSION_V2,
  LICENCE_VERSION_V2_SAP,
} from "@src/@types/Licence";

import type {
  Licence,
  LicenceKind,
  LicenceServerStatus,
  LicenceStats,
} from "@src/@types/Licence";

/** User facing names for the licence flavours. Never show the raw `v2-sap`. */
export const LICENCE_KIND_LABELS: Record<LicenceKind, string> = {
  standard: "Standard",
  sap: "SAP",
};

class LicenceUtils {
  static emptyStats(): LicenceStats {
    return {
      currentPerformedMigrations: 0,
      currentPerformedReplicas: 0,
      lifetimePerformedMigrations: 0,
      lifetimePerformedReplicas: 0,
      currentAvailableMigrations: 0,
      currentAvailableReplicas: 0,
      lifetimeAvailableMigrations: 0,
      lifetimeAvailableReplicas: 0,
    };
  }

  static isSapVersion(version: string): boolean {
    return version === LICENCE_VERSION_V2_SAP;
  }

  static getKindLabel(kind: LicenceKind): string {
    return LICENCE_KIND_LABELS[kind];
  }

  /**
   * The appliance ID is handed to the Coriolis representative suffixed with the
   * licence format the appliance expects. SAP licences are a variant of the
   * same `v2` format rather than a newer one, so they must not be picked here.
   */
  static getApplianceIdWithVersion(
    applianceId: string,
    serverStatus: LicenceServerStatus,
  ): string {
    const versions = serverStatus.supported_licence_versions || [];
    const version =
      versions.find(v => !LicenceUtils.isSapVersion(v)) || LICENCE_VERSION_V2;
    return `${applianceId}-licence${version}`;
  }

  /** Whether any allowance at all was ever issued for this flavour. */
  static hasStats(stats: LicenceStats): boolean {
    return (
      stats.currentAvailableMigrations > 0 ||
      stats.currentAvailableReplicas > 0 ||
      stats.lifetimeAvailableMigrations > 0 ||
      stats.lifetimeAvailableReplicas > 0
    );
  }

  /**
   * The flavours the appliance actually holds licences for, in display order.
   * Falls back to Standard so an appliance with no allowance at all still
   * renders its (empty) standard counters rather than nothing.
   */
  static getActiveKinds(licence: Licence): LicenceKind[] {
    const kinds: LicenceKind[] = [];
    if (LicenceUtils.hasStats(licence.standardStats)) {
      kinds.push("standard");
    }
    if (LicenceUtils.hasStats(licence.sapStats)) {
      kinds.push("sap");
    }
    return kinds.length ? kinds : ["standard"];
  }

  static getStats(licence: Licence, kind: LicenceKind): LicenceStats {
    return kind === "sap" ? licence.sapStats : licence.standardStats;
  }
}

export default LicenceUtils;
