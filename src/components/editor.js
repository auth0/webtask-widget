import Debounce from 'lodash.debounce';
import Genid from 'genid';
import React from 'react';
import Sandbox from 'sandboxjs';

import {Modal} from 'react-bootstrap';
import ReactZeroClipboard from 'react-zeroclipboard';

import AceEditor from '../components/ace';
import EditorOptions from '../components/editorOptions';
import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';
import Logs from '../components/logs';
import ScheduleEditor from '../components/scheduleEditor';
import SecretsEditor from '../components/secretsEditor';
import TryWebtask from '../components/tryWebtask';

import ComponentStack from '../lib/componentStack';
import dedent from '../lib/dedent';


import '../styles/editor.less';

export default class A0Editor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            schedule: props.schedule,
            code: props.code,
            secrets: props.secrets,
            creatingToken: false,
            showAdvanced: false,
            savingWebtask: false,
            mergeBody: props.mergeBody,
            parseBody: props.parseBody,
            name: props.name,
            successMessage: '',
            pane: 'Logs',
        };

        const debounceInterval = Math.max(1000, Number(props.autoSaveInterval));

        this.autoSave = Debounce(() => this.saveWebtask(), debounceInterval);
        
        const secretPane = {
            name: 'Secrets',
            iconClass: '-key',
            vdom: (
                <SecretsEditor
                    ref="secrets"
                    secrets={ this.state.secrets }
                    onChange={ (secrets) => this.setState({ secrets }) }
                />
            ),
        };
        
        const schedulePane = {
            name: 'Schedule',
            iconClass: '-clock',
            vdom: (
                <ScheduleEditor
                    ref="schedule"
                    secrets={ this.state.secrets }
                    onChange={ (schedule) => this.setState({ schedule }) }
                />
            ),
        };
        
        const settingsPane = {
            name: 'Settings',
            iconClass: '-gear',
            vdom: (
                <EditorOptions
                    ref="settings"
                    mergeBody={ this.state.mergeBody }
                    parseBody={ this.state.parseBody }
                    onChange={ (options) => this.setState(options) }
                />
            ),
        };
        
        const logsPane = {
            name: 'Logs',
            iconClass: '-split',
            vdom: (
                <Logs
                    ref="logs"
                    profile={ this.props.profile }
                />
            ),
        };
        
        this.panes = [secretPane, schedulePane, settingsPane, logsPane];
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.creatingToken
            || state.savingWebtask;
        const onChangeCode = this.onChangeCode.bind(this);
        const onChangeAdvancedOptions = this.onChangeAdvancedOptions.bind(this);
        const saveWebtask = this.saveWebtask.bind(this);
        const setState = this.setState.bind(this);
        const toggleSecrets = this.toggleSecrets.bind(this);
        const tryWebtask = this.tryWebtask.bind(this);
        const onChangeSchedule = this.onChangeSchedule.bind(this);
        const getSecrets = () => this.refs.secrets.getValue();
        
        const copyButton = this.state.webtask
            ?   (
                    <ReactZeroClipboard text={ state.webtask.url }>
                        <Button>Copy</Button>
                    </ReactZeroClipboard>
                )
            :   null;

        return (
            <div className="a0-editor">
                <div className="a0-editor-split">
                    <div className="a0-editor-left">
                        <div className="a0-editor-toolbar">
                        </div>
                        <div className="a0-editor-body">
                            <AceEditor
                                ref="ace"
                                name="code"
                                className="a0-editor-ace"
                                mode="javascript"
                                theme="textmate"
                                fontSize={ 14 }
                                value={ state.code }
                                maxLines={ 15 }
                                minLines={ 5 }
                                height=""
                                width=""
                                onChange={ onChangeCode }
                                highlightActiveLine={ false }
                                editorProps={ { $blockScrolling: true } }
                            />
                        </div>
                    </div>
                    <div className="a0-editor-right">
                        <div className="a0-editor-toolbar">
                            {
                                this.panes.map((pane) => {
                                    const classNames = ['a0-icon-button', '-icon', pane.iconClass];
                                    
                                    if (pane.name === state.pane) classNames.push('-arrow-below');
                                
                                    return <button
                                        className={ classNames.join(' ') }
                                        key={ pane.name }
                                        onClick={ () => setState({ pane: pane.name }) }
                                    >{ pane.name }</button>;
                                })
                            }
                        </div>
                        <div className="a0-editor-sidebar">
                            {
                                this.panes
                                    .map(pane => (
                                        <div key={ pane.name } className={ 'a0-sidebar-pane ' + (pane.name === state.pane ? '-active' : '') }>
                                            { pane.vdom }
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>
                <div className="a0-editor-footer">
                    <div className="a0-webtask-url">
                        <span className="a0-container-url">
                            { props.profile.url + '/api/run/' + props.profile.container + '/' }
                        </span>
                        <input className="a0-name-input -inline"
                            value={ this.state.name }
                            onChange={ (e) => this.setState({ name: e.target.value }) }
                        />
                        <button className="a0-icon-button -copy"></button>
                    </div>
                    <div className="a0-footer-actions">
                        <button className="a0-inline-button -primary">Save</button>
                        <button className="a0-inline-button -success"
                            onClick={ e => this.onClickRun() }
                        >Run</button>
                    </div>
                </div>
            </div>
        );
    }
    
    onChangeAdvancedOptions({ name, mergeBody, parseBody, secrets }) {
        this.setState({ name, mergeBody, parseBody, secrets });
    }
    
    onChangeCode(code) {
        this.setState({ code });
    }
    
    onChangeSchedule(schedule) {
        this.setState({ schedule: this.refs.schedule.getValue() });
    }
    
    onClickRun() {
        this.setState({
            pane: 'Logs',
        });
        
        this.saveWebtask()
            .then((webtask) => {
                console.log('webtask', webtask);
                return webtask.run({
                    method: 'get',
                    parse: !!this.state.parseBody,
                    merge: !!this.state.mergeBody,
                });
            })
            .tap((res) => {
                const headers = res.header;
                const auth0HeaderRx = /^x-auth0/;

                for (let header in headers) {
                    if (auth0HeaderRx.test(header)) {
                        headers[header] = JSON.parse(headers[header]);
                    }
                }

                this.refs.logs.push({
                    data: {
                        headers: headers,
                        statusCode: res.status,
                        body: res.body || res.text,
                    },
                });
            });
    }
    
    saveWebtask ({hideSuccessMessage = false} = {}) {
        // Cancel any pending autoSaves
        this.autoSave.cancel();

        this.setState({
            savingWebtask: true,
            successMessage: '',
        });
        
        let promise = this.props.profile.create(this.state.code, {
            merge: this.state.mergeBody,
            parse: this.state.parseBody,
            secrets: this.state.secrets,
            name: this.state.name,
        });
        
        if (this.props.onSave) {
            promise = promise
                .tap(this.props.onSave);
        }
        
        promise = promise
            .tap(() => !hideSuccessMessage && this.setState({
                successMessage: 'Webtask successfully created',
            }))
            .tap((webtask) => this.setState({
                webtask,
            }))
            .finally(() => this.setState({ savingWebtask: false }));
        
        return promise;
    }
    
    toggleSecrets(e) {
        e.preventDefault();
        
        this.setState({
            showAdvanced: !this.state.showAdvanced
        });
    }
    
    tryWebtask(e) {
        e.preventDefault();
        
        const tryWebtaskProps = {
            profile: this.props.profile,
            name: this.state.name,
            mergeBody: this.state.mergeBody,
            parseBody: this.state.parseBody,
            secrets: this.state.secrets,
            code: this.state.code,
            tryParams: this.props.tryParams,
        };
        
        this.props.componentStack.push(TryWebtask, tryWebtaskProps);
    }
}

A0Editor.title = 'Create a webtask';

A0Editor.propTypes = {
    componentStack:         React.PropTypes.instanceOf(ComponentStack).isRequired,
    profile:                React.PropTypes.instanceOf(Sandbox).isRequired,
    name:                   React.PropTypes.string,
    mergeBody:              React.PropTypes.bool,
    parseBody:              React.PropTypes.bool,
    autoSaveInterval:       React.PropTypes.number,
    autoSaveOnChange:       React.PropTypes.bool,
    autoSaveOnLoad:         React.PropTypes.bool,
    showWebtaskUrl:         React.PropTypes.bool,
    showTryWebtaskUrl:      React.PropTypes.bool,
    showScheduleInput:      React.PropTypes.bool,
    schedule:               React.PropTypes.string,
    secrets:                React.PropTypes.object,
    code:                   React.PropTypes.string,
    tryParams:              React.PropTypes.object,
    onSave:                 React.PropTypes.func,
};

A0Editor.defaultProps = {
    mergeBody:              false,
    parseBody:              false,
    name:                   Genid(5),
    autoSaveInterval:       1000,
    autoSaveOnChange:       false,
    autoSaveOnLoad:         false,
    showWebtaskUrl:         true,
    showTryWebtaskUrl:      true,
    showScheduleInput:      false,
    schedule:               '* * * * *',
    secrets:                {},
    code:                   dedent`
                                module.exports = function (ctx, cb) {
                                    cb(null, 'Hello ' + ctx.query.hello);
                                };
                            `.trim(),
    tryParams:              {
                                path: '',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                query: {
                                    hello: 'world',
                                },
                                body: {
                                    hint: 'Only sent for PUT, POST and PATCH requests',
                                },
                            },
};
