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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import { UserScriptData, UserScriptValue } from "@src/@types/MainItem";
import { InstanceImage } from "@src/components/modules/WizardModule/WizardInstances";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import InfoIcon from "@src/components/ui/InfoIcon";
import Modal from "@src/components/ui/Modal";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";

import scriptItemImage from "./images/script-item.svg";
import UserScriptsModal, { ScriptsByPhase } from "./UserScriptsModal";

import type {
  Instance,
  InstanceScript,
  UserScriptTarget,
} from "@src/@types/Instance";
import {
  DEFAULT_USER_SCRIPT_PHASE,
  USER_SCRIPT_PHASES,
  UserScriptPhase,
} from "@src/@types/Instance";

const parseScriptValueByPhase = (value: UserScriptValue): ScriptsByPhase => {
  const map: ScriptsByPhase = {};
  if (!value) {
    return map;
  }
  if (typeof value === "string") {
    map[DEFAULT_USER_SCRIPT_PHASE] = { content: value, fileName: null };
    return map;
  }
  value.forEach(item => {
    map[item.phase || DEFAULT_USER_SCRIPT_PHASE] = {
      content: item.payload,
      fileName: null,
    };
  });
  return map;
};

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  min-height: 0;
`;
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;
const Heading = styled.div<any>`
  margin-bottom: 16px;
  font-size: ${props => (props.layout === "modal" ? "16px" : "24px")};
  font-weight: ${props =>
    props.layout === "modal"
      ? ThemeProps.fontWeights.medium
      : ThemeProps.fontWeights.light};
  display: flex;
`;
const InfoIconStyled = styled(InfoIcon)<any>`
  margin-top: ${props => (props.layout === "modal" ? "1px" : "5px")};
  margin-left: 8px;
`;
const Scripts = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const Script = styled.div<any>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const Name = styled.div<any>`
  display: flex;
  align-items: center;
`;
const OsImage = styled.div<any>`
  ${ThemeProps.exactSize("48px")}
  background: url('${scriptItemImage}') center no-repeat;
`;
const NameLabel = styled.div<any>`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
`;
const NameLabelTitle = styled.div<any>`
  font-size: 16px;
  word-break: break-word;
`;
const NameLabelSubtitle = styled.div<any>`
  font-size: 12px;
  color: ${ThemePalette.grayscale[5]};
  margin-top: 1px;
  word-break: break-word;
`;
const LinkButton = styled.div<any>`
  color: ${ThemePalette.primary};
  flex-shrink: 0;
  margin: 0 8px 0 16px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;
type ModalTarget = UserScriptTarget & { title: string };

type Props = {
  instances: Instance[];
  uploadedScripts: InstanceScript[];
  removedScripts: InstanceScript[];
  layout?: "modal" | "page";
  loadingInstances?: boolean;
  userScriptData: UserScriptData | null | undefined;
  style?: React.CSSProperties;
  onScrollableRef?: (ref: HTMLElement) => void;
  scrollableRef?: (r: HTMLElement) => void;
  onScriptsChange: (
    target: UserScriptTarget,
    scripts: InstanceScript[],
    hadExisting: boolean,
  ) => void;
};
type State = {
  modalTarget: ModalTarget | null;
};
@observer
class WizardScripts extends React.Component<Props, State> {
  state: State = {
    modalTarget: null,
  };

  matchesTarget(script: InstanceScript, target: UserScriptTarget): boolean {
    return target.global
      ? script.global === target.global
      : script.instanceId === target.instanceId;
  }

  getBaseValue(target: UserScriptTarget): UserScriptValue {
    if (target.global) {
      return this.props.userScriptData?.global?.[target.global] ?? null;
    }
    if (target.instanceId) {
      return this.props.userScriptData?.instances?.[target.instanceId] ?? null;
    }
    return null;
  }

  getScriptsByPhase(target: UserScriptTarget): ScriptsByPhase {
    const uploaded = this.props.uploadedScripts.filter(s =>
      this.matchesTarget(s, target),
    );
    const isRemoved = this.props.removedScripts.some(s =>
      this.matchesTarget(s, target),
    );
    if (uploaded.length || isRemoved) {
      const map: ScriptsByPhase = {};
      uploaded.forEach(s => {
        map[s.phase || DEFAULT_USER_SCRIPT_PHASE] = {
          content: s.scriptContent,
          fileName: s.fileName,
        };
      });
      return map;
    }
    return parseScriptValueByPhase(this.getBaseValue(target));
  }

  getConfiguredPhases(target: UserScriptTarget): UserScriptPhase[] {
    const map = this.getScriptsByPhase(target);
    return USER_SCRIPT_PHASES.filter(phase => map[phase]?.content);
  }

  computeHadExisting(target: UserScriptTarget): boolean {
    const baseMap = parseScriptValueByPhase(this.getBaseValue(target));
    return USER_SCRIPT_PHASES.some(phase => baseMap[phase]?.content);
  }

  handleModalSave(target: ModalTarget, scripts: InstanceScript[]) {
    this.props.onScriptsChange(
      { global: target.global, instanceId: target.instanceId },
      scripts,
      this.computeHadExisting(target),
    );
    this.setState({ modalTarget: null });
  }

  renderScriptItem(opts: {
    global?: "windows" | "linux";
    instanceId?: string;
    title: string;
    subtitle?: string;
  }) {
    const { global, instanceId, title, subtitle } = opts;
    const target: UserScriptTarget = {
      global: global ?? null,
      instanceId: instanceId ?? null,
    };
    const isConfigured = this.getConfiguredPhases(target).length > 0;

    return (
      <Script key={title}>
        <Name>
          {global ? <OsImage /> : <InstanceImage />}
          <NameLabel>
            <NameLabelTitle>{title}</NameLabelTitle>
            {subtitle ? (
              <NameLabelSubtitle>{subtitle}</NameLabelSubtitle>
            ) : null}
          </NameLabel>
        </Name>
        <LinkButton
          onClick={() => {
            this.setState({ modalTarget: { ...target, title } });
          }}
        >
          {isConfigured ? "Edit Scripts" : "Choose Scripts"}
        </LinkButton>
      </Script>
    );
  }

  renderScriptGroup(group: "global" | "instance") {
    if (group === "global") {
      return (
        <Group>
          <Heading layout={this.props.layout}>
            Global Scripts
            <InfoIconStyled
              layout={this.props.layout}
              text="Specify user scripts that will run during OS morphing for a particular OS type. You can attach one script per phase."
            />
          </Heading>
          <Scripts>
            {this.renderScriptItem({
              global: "windows",
              title: "Windows Script File",
            })}
            {this.renderScriptItem({
              global: "linux",
              title: "Linux Script File",
            })}
          </Scripts>
        </Group>
      );
    }

    if (this.props.instances.length === 0 && !this.props.loadingInstances) {
      return null;
    }

    return (
      <Group layout={this.props.layout}>
        <Heading layout={this.props.layout}>
          Instance Scripts
          {!this.props.loadingInstances ? (
            <InfoIconStyled
              layout={this.props.layout}
              text="Specify user scripts that will run during OS morphing for a particular instance. You can attach one script per phase. These override the uploaded global scripts."
            />
          ) : null}
          {this.props.loadingInstances ? (
            <StatusIcon
              style={{ marginTop: "1px", marginLeft: "8px" }}
              status="RUNNING"
            />
          ) : null}
        </Heading>
        <Scripts>
          {this.props.instances.map(instance => {
            const id = instance.instance_name || instance.id;
            const title = instance.name;
            const osLabel = instance.os_type
              ? instance.os_type === "windows"
                ? "Windows"
                : instance.os_type === "linux"
                  ? "Linux"
                  : instance.os_type
              : "";
            const osType = osLabel ? `${osLabel} OS | ` : "";
            const subtitle = `${osType}${instance.num_cpu} vCPU | ${instance.memory_mb} MB RAM`;

            return this.renderScriptItem({ instanceId: id, title, subtitle });
          })}
        </Scripts>
      </Group>
    );
  }

  render() {
    const { modalTarget } = this.state;
    return (
      <Wrapper
        style={this.props.style}
        ref={(r: HTMLElement) => {
          if (this.props.onScrollableRef) {
            this.props.onScrollableRef(r);
          }
        }}
      >
        {this.renderScriptGroup("global")}
        {this.renderScriptGroup("instance")}
        <Modal
          isOpen={Boolean(modalTarget)}
          title={modalTarget ? `${modalTarget.title} - User Scripts` : ""}
          contentWidth={576}
          onRequestClose={() => this.setState({ modalTarget: null })}
        >
          {modalTarget ? (
            <UserScriptsModal
              title={modalTarget.title}
              global={modalTarget.global}
              instanceId={modalTarget.instanceId}
              scriptsByPhase={this.getScriptsByPhase(modalTarget)}
              onRequestClose={() => this.setState({ modalTarget: null })}
              onSave={scripts => this.handleModalSave(modalTarget, scripts)}
            />
          ) : null}
        </Modal>
      </Wrapper>
    );
  }
}

export default WizardScripts;
