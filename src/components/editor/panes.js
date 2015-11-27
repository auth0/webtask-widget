import React from 'react';

import Logs from 'components/logs';

import AceEditor from './aceEditor';
import EditorOptions from './editorOptions';
import ScheduleEditor from './scheduleEditor';
import SecretsEditor from './secretsEditor';

export const HistoryPane = {
    iconClass: '-history',
    name: 'History',
    renderBody() {
        return (
            null
        );
    },
    renderSidebar() {
        return (
            null
        );
    },
};

export const LogsPane = {
    iconClass: '-split',
    name: 'Logs',
    renderBody: renderEditor,
    renderSidebar() {
        return (
            <div className="a0-sidebar-logs">
                <button className="a0-clear -inverted -trash"
                    onClick={ e => this.refs.logs.clear() }
                ></button>
                <Logs
                    ref="logs"
                    sandbox={ this.props.sandbox }
                />
            </div>
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
                cronJob={ this.props.cronJob }
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