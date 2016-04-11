import React from 'react';

import Logs from 'components/logs';

import AceEditor from './aceEditor';
import EditorOptions from './editorOptions';
import HistoryItemInspector from './historyItemInspector';
import JobHistory from './jobHistory';
import ScheduleEditor from './scheduleEditor';
import SecretsEditor from './secretsEditor';

export const CodePane = {
    hideSidebar: true,
    iconClass: '-code',
    name: 'Code',
    renderBody: renderEditor,
    renderSidebar: noRender,
};

export const HistoryPane = {
    iconClass: '-history',
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

export const LogsPane = {
    iconClass: '-split',
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
    name: 'Secrets',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <SecretsEditor
                ref="secrets"
                secrets={ this.state.secrets }
                onChange={ secrets => this.onChangeSecrets(secrets) }
            />
        );
    },
};

export const SettingsPane = {
    iconClass: '-gear',
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
