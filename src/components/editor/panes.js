import React from 'react';

import Logs from 'components/logs';

import AceEditor from './aceEditor';
import EditorOptions from './editorOptions';
import HistoryItemInspector from './historyItemInspector';
import JobHistory from './jobHistory';
import KeyValueListEditor from './keyValueListEditor';
import ScheduleEditor from './scheduleEditor';

export const CodePane = {
    hideSidebar: true,
    iconClass: '-code',
    id: 'code',
    name: 'Code',
    renderBody: renderEditor,
    renderSidebar: noRender,
};

export const HistoryPane = {
    iconClass: '-history',
    id: 'history',
    name: 'History',
    renderBody() {
        return (
            <JobHistory
                job={ this.state.subject }
                onSelect={ item => this.onSelectHistoryItem(item) }
                selected={ this.state.selectedHistoryItem }
            />
        );
    },
    renderSidebar() {
        return (
            <HistoryItemInspector
                item={ this.state.selectedHistoryItem }
            />
        );
    },
};

export const MetadataPane = {
    iconClass: '-tag',
    id: 'meta',
    name: 'Metadata',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <div className="a0-sidebar-metadata a0-sidebar-scroller">
                <div className="a0-sidebar-intro">
                    <h2 className="a0-title">Metadata</h2>
                    <p className="a0-explanation">You can associate metadata with saved webtasks. This metadata can be used to query saved webtasks using the http api.</p>
                </div>
                <KeyValueListEditor
                    ref="meta"
                    secrets={ this.state.meta }
                    onChange={ meta => this.onChangeMeta(meta) }
                    valueType="text"
                />
            </div>
        );
    },
};

export const LogsPane = {
    iconClass: '-split',
    id: 'logs',
    name: 'Realtime Logs',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <Logs
                ref="logs"
                sandbox={ this.props.sandbox }
            />
        );
    },
};

export const SchedulePane = {
    iconClass: '-clock',
    id: 'schedule',
    name: 'Schedule',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <ScheduleEditor
                ref="schedule"
                schedule={ this.state.schedule }
                state={ this.getJobState() }
                stateChangePending={ this.state.jobStateChangePending }
                onChangeSchedule={ schedule => this.onChangeSchedule(schedule) }
                onChangeState={ state => this.onChangeState(state) }
            />
        );
    },
};

export const SecretsPane = {
    iconClass: '-key',
    id: 'secrets',
    name: 'Secrets',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <div className="a0-sidebar-secrets a0-sidebar-scroller">
                <div className="a0-sidebar-intro">
                    <h2 className="a0-title">Secrets</h2>
                    <p className="a0-explanation">You can create webtasks that depend on a set of encrypted secrets, like an API key or connection string. To access the secret use: <code>context.secrets.KEY</code>.</p>
                </div>
                <KeyValueListEditor
                    ref="secrets"
                    secrets={ this.state.secrets }
                    onChange={ secrets => this.onChangeSecrets(secrets) }
                />
            </div>
        );
    },
};

export const SettingsPane = {
    iconClass: '-gear',
    id: 'settings',
    name: 'Settings',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <EditorOptions
                ref="settings"
                mergeBody={ this.state.mergeBody }
                parseBody={ this.state.parseBody }
                onChange={ options => this.onChangeOptions(options) }
            />
        );
    },
};


function noRender() {
    return;
}

function renderEditor () {
    return (
        <AceEditor
            ref="ace"
            name="code"
            className="a0-editor-ace"
            mode="javascript"
            theme="textmate"
            fontSize={ 14 }
            value={ this.state.code }
            maxLines={ 15 }
            minLines={ 5 }
            height=""
            width=""
            onChange={ code => this.onChangeCode(code) }
            highlightActiveLine={ false }
            editorProps={ { $blockScrolling: true } }
        />
    );
}
