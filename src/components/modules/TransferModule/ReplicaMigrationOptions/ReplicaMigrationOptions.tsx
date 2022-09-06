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

import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";

import Button from "@src/components/ui/Button";
import FieldInput from "@src/components/ui/FieldInput";
import ToggleButtonBar from "@src/components/ui/ToggleButtonBar";
import WizardScripts from "@src/components/modules/WizardModule/WizardScripts";

import LabelDictionary from "@src/utils/LabelDictionary";
import KeyboardManager from "@src/utils/KeyboardManager";

import type { Field } from "@src/@types/Field";
import type { Instance, InstanceScript } from "@src/@types/Instance";
import { TransferItemDetails } from "@src/@types/MainItem";
import { MinionPool } from "@src/@types/MinionPool";
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from "@src/components/modules/WizardModule/WizardOptions";
import { ThemeProps } from "@src/components/Theme";
import replicaMigrationFields from "./replicaMigrationFields";
import replicaMigrationImage from "./images/replica-migration.svg";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
  min-height: 0;
`;
const Image = styled.div<any>`
  ${ThemeProps.exactWidth("288px")}
  ${ThemeProps.exactHeight("96px")}
  background: url('${replicaMigrationImage}') center no-repeat;
  margin: 80px 0;
`;
const OptionsBody = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const ScriptsBody = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  min-height: 0;
  margin-bottom: 32px;
`;
const Form = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-left: -64px;
  justify-content: space-between;
  margin: 0 auto;
`;
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const FieldInputStyled = styled(FieldInput)`
  width: 224px;
  justify-content: space-between;
  margin-bottom: 32px;
`;

type Props = {
  instances: Instance[];
  transferItem: TransferItemDetails | null;
  minionPools: MinionPool[];
  loadingInstances: boolean;
  defaultSkipOsMorphing?: boolean | null;
  onCancelClick: () => void;
  onMigrateClick: (opts: {
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    minionPoolMappings: { [instance: string]: string };
  }) => void;
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void;
};
type State = {
  fields: Field[];
  selectedBarButton: string;
  uploadedScripts: InstanceScript[];
  removedScripts: InstanceScript[];
  minionPoolMappings: { [instance: string]: string };
};

@observer
class ReplicaMigrationOptions extends React.Component<Props, State> {
  state: State = {
    fields: [],
    selectedBarButton: "options",
    uploadedScripts: [],
    removedScripts: [],
    minionPoolMappings: {},
  };

  scrollableRef!: HTMLElement;

  UNSAFE_componentWillMount() {
    const mappings =
      this.props.transferItem?.instance_osmorphing_minion_pool_mappings || {};

    this.setState({
      fields: replicaMigrationFields.map(f =>
        f.name === "skip_os_morphing"
          ? { ...f, value: this.props.defaultSkipOsMorphing || null }
          : f
      ),
      minionPoolMappings: { ...mappings },
    });
  }

  componentDidMount() {
    KeyboardManager.onEnter(
      "migration-options",
      () => {
        this.migrate();
      },
      2
    );
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.selectedBarButton !== this.state.selectedBarButton) {
      if (this.props.onResizeUpdate) {
        this.props.onResizeUpdate(this.scrollableRef, 0);
      }
    }
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown("migration-options");
  }

  migrate() {
    this.props.onMigrateClick({
      fields: this.state.fields,
      uploadedUserScripts: this.state.uploadedScripts,
      removedUserScripts: this.state.removedScripts,
      minionPoolMappings: this.state.minionPoolMappings,
    });
  }

  handleValueChange(field: Field, value: boolean) {
    this.setState(prevState => {
      const fields = prevState.fields.map(f => {
        const newField = { ...f };
        if (f.name === field.name) {
          newField.value = value;
        }
        return newField;
      });

      return { fields };
    });
  }

  handleCanceScript(global: string | null, instanceName: string | null) {
    this.setState(prevState => ({
      uploadedScripts: prevState.uploadedScripts.filter(s =>
        global ? s.global !== global : s.instanceId !== instanceName
      ),
    }));
  }

  handleScriptUpload(script: InstanceScript) {
    this.setState(prevState => ({
      uploadedScripts: [...prevState.uploadedScripts, script],
    }));
  }

  handleScriptRemove(script: InstanceScript) {
    this.setState(prevState => ({
      removedScripts: [...prevState.removedScripts, script],
    }));
  }

  renderField(field: Field) {
    return (
      <FieldInputStyled
        width={224}
        key={field.name}
        name={field.name}
        type={field.type}
        value={field.value || field.default}
        minimum={field.minimum}
        maximum={field.maximum}
        layout="page"
        label={field.label || LabelDictionary.get(field.name)}
        onChange={value => this.handleValueChange(field, value)}
        description={LabelDictionary.getDescription(field.name)}
      />
    );
  }

  renderMinionPoolMappings() {
    const minionPools = this.props.minionPools.filter(
      m => m.endpoint_id === this.props.transferItem?.destination_endpoint_id
    );
    if (!minionPools.length) {
      return null;
    }

    const properties: Field[] = this.props.instances.map(instance => ({
      name: instance.instance_name || instance.id,
      label: instance.name,
      type: "string",
      enum: minionPools.map(minionPool => ({
        name: minionPool.name,
        id: minionPool.id,
      })),
    }));

    return (
      <FieldInputStyled
        width={500}
        style={{ marginBottom: "64px" }}
        name={INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS}
        type="object"
        valueCallback={field =>
          this.state.minionPoolMappings &&
          this.state.minionPoolMappings[field.name]
        }
        layout="page"
        label="Instance OSMorphing Minion Pool Mappings"
        onChange={(value, field) =>
          this.setState(prevState => {
            const minionPoolMappings = { ...prevState.minionPoolMappings };
            minionPoolMappings[field!.name] = value;
            return { minionPoolMappings };
          })
        }
        properties={properties}
        labelRenderer={(propName: string) =>
          propName.indexOf("/") > -1
            ? propName.split("/")[propName.split("/").length - 1]
            : propName
        }
      />
    );
  }

  renderOptions() {
    return (
      <>
        <Form>{this.state.fields.map(field => this.renderField(field))}</Form>
        {this.renderMinionPoolMappings()}
      </>
    );
  }

  renderScripts() {
    return (
      <WizardScripts
        instances={this.props.instances}
        loadingInstances={this.props.loadingInstances}
        onScriptUpload={s => {
          this.handleScriptUpload(s);
        }}
        onScriptDataRemove={s => {
          this.handleScriptRemove(s);
        }}
        onCancelScript={(g, i) => {
          this.handleCanceScript(g, i);
        }}
        uploadedScripts={this.state.uploadedScripts}
        removedScripts={this.state.removedScripts}
        userScriptData={this.props.transferItem?.user_scripts}
        scrollableRef={(r: HTMLElement) => {
          this.scrollableRef = r;
        }}
        layout="modal"
      />
    );
  }

  renderBody() {
    const Body =
      this.state.selectedBarButton === "options" ? OptionsBody : ScriptsBody;

    return (
      <Body>
        <ToggleButtonBar
          items={[
            { label: "Options", value: "options" },
            { label: "User Scripts", value: "script" },
          ]}
          selectedValue={this.state.selectedBarButton}
          onChange={item => {
            this.setState({ selectedBarButton: item.value });
          }}
          style={{ marginBottom: "32px" }}
        />
        {this.state.selectedBarButton === "options"
          ? this.renderOptions()
          : this.renderScripts()}
      </Body>
    );
  }

  render() {
    return (
      <Wrapper>
        <Image />
        {this.renderBody()}
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.migrate();
            }}
          >
            Migrate
          </Button>
        </Buttons>
      </Wrapper>
    );
  }
}

export default ReplicaMigrationOptions;
