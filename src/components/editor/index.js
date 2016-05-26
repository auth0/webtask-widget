import Bluebird from 'bluebird';
import Genid from 'genid';
import ComponentStack from 'lib/componentStack';
import React from 'react';
import Sandbox from 'sandboxjs';
import merge from 'lodash.merge';

import {
    LogsPane
} from './panes';

import {
    CreateCronJobStrategy,
    CreateWebtaskStrategy,
    EditCronJobStrategy,
    EditWebtaskStrategy
} from './strategies';

import PaneSelector from './paneSelector';
import WebtaskUrl from './webtaskUrl';


import 'styles/editor.less';


export default class WebtaskEditor extends React.Component {
    constructor(props) {
        super(props);

        this.requiresInspection = typeof this.props.edit === 'string';

        this.strategy = this.props.cron
            ?   this.props.edit
                ?   EditCronJobStrategy
                :   CreateCronJobStrategy
            :   this.props.edit
                ?   EditWebtaskStrategy
                :   CreateWebtaskStrategy;

        this.state = {
            code: this.requiresInspection
                ?   ''
                :   this.props.code || this.strategy.defaultCode,
            currentPane: null,
            inspectionInProgress: false,
            jobState: this.props.jobState,
            mergeBody: typeof this.props.mergeBody !== 'undefined'
                ?   this.props.mergeBody
                :   this.strategy.defaultMergeBody,
            name: this.requiresInspection
                ?   ''
                :   props.name,
            parseBody: typeof this.props.parseBody !== 'undefined'
                ?   this.props.parseBody
                :   this.strategy.defaultParseBody,
            runInProgress: false,
            saveInProgress: false,
            schedule: props.schedule,
            secrets: this.requiresInspection
                ?   {}
                :   props.secrets,
            subject: props.edit,
            useSuffixOnRun: typeof props.useSuffixOnRun === 'undefined' ? true : props.useSuffixOnRun
        };
    }

    componentWillMount() {
        let initialPane = this.strategy.defaultPane;

        for (let i in this.strategy.panes) {
            let pane = this.strategy.panes[i];

            if (pane.id === this.props.pane) {
                initialPane = pane;
            }
        }

        this.inspected$ = this.requiresInspection
            ?   this.inspect()
            :   Bluebird.resolve();

        this.inspected$
            .tap(() => this.setState({ currentPane: initialPane }));
    }

    render() {
        const editorBody = this.state.currentPane
            ?   this.state.currentPane.renderBody.call(this)
            :   (
                    <div className="a0-editor-loading">
                        <span>Loading...</span>
                    </div>
                );
        const urlInfo = merge({}, this.strategy.getUrlInfo(this.props.sandbox), this.props.urlInfo);
        const hideSidebar = this.state.currentPane
            && !!this.state.currentPane.hideSidebar;

        const error = this.state.error
            ?   (
                    <div className="a0-error-message"
                        onClick={ e => this.onClickError() }
                    >
                        { this.state.error.message }
                    </div>
                )
            :   null;

        const paneSelector = (
            <PaneSelector
                currentPane={ this.state.currentPane }
                panes={ this.strategy.panes }
                onChange={ pane => this.onChangePane(pane) }
            />
        );

        const runButton = (
            <button className="a0-inline-button -success"
                disabled={ this.state.runInProgress || this.state.inspectionInProgress }
                onClick={ e => this.onClickRun() }
            >
                { this.state.runInProgress
                ?   'Running...'
                :   'Run'
                }
            </button>
        );

        const saveButton = (
            <button className="a0-inline-button -primary"
                disabled={ this.state.saveInProgress || this.state.inspectionInProgress }
                onClick={ e => this.onClickSave() }
            >
                { this.state.saveInProgress
                ?   'Saving...'
                :   'Save'
                }
            </button>
        );

        const sidebarBody = this.strategy.panes.map(pane => (
            <div key={ pane.name } className={ 'a0-sidebar-pane ' + (pane === this.state.currentPane ? '-active' : '') }>
                { pane.renderSidebar.call(this) }
            </div>
        ));

        const webtaskUrl = (
            <WebtaskUrl
                copyButton={ urlInfo.copyButton }
                disabled={ this.state.saveInProgress || this.state.inspectionInProgress }
                name={ this.state.name }
                onChangeName={ name => this.setState({ name }) }
                prefix={ urlInfo.prefix }
                readonly={ urlInfo.readonly }
            />
        );

        const splitBody = hideSidebar || this.state.inspectionInProgress
            ?   [
                    <div className="a0-editor-split" key="split">
                        <div className="a0-editor-left">
                            <div className="a0-editor-toolbar">
                                { this.props.backButton }
                            </div>
                        </div>
                        <div className="a0-editor-right">
                            <div className="a0-editor-toolbar">
                                { paneSelector }
                            </div>
                            {
                                // Keep the sidebars in the DOM, but hide them via css.
                                // This means the Logs sidebar Widget isn't wiped out.
                            }
                            <div className="a0-editor-sidebar" key="sidebar">
                                { sidebarBody }
                            </div>
                        </div>
                    </div>,
                    <div className="a0-editor-body" key="body">
                        { error }
                        { editorBody }
                    </div>,
                ]
            :   [
                    <div className="a0-editor-placeholder" key="placeholder"></div>,
                    <div className="a0-editor-split" key="split">
                        <div className="a0-editor-left">
                            <div className="a0-editor-toolbar">
                                { this.props.backButton }
                            </div>
                            <div className="a0-editor-body">
                                { error }
                                { editorBody }
                            </div>
                        </div>
                        <div className="a0-editor-right">
                            <div className="a0-editor-toolbar">
                                { paneSelector }
                            </div>
                            <div className="a0-editor-sidebar" key="sidebar">
                                { sidebarBody }
                            </div>
                        </div>
                    </div>
                 ];

        return (
            <div className="a0-editor-widget">
                { splitBody }
                <div className="a0-editor-footer">
                    <div className="a0-webtask-url">
                        { webtaskUrl }
                    </div>
                    <div className="a0-footer-actions">
                        { saveButton }
                        { runButton }
                    </div>
                </div>
            </div>
        );
    }

    getJobState() {
        return this.strategy.getJobState.call(this);
    }

    onChangeCode(code) {
        this.setState({ code });
    }

    onChangeOptions(options) {
        this.setState(options);
    }

    onChangePane(pane) {
        this.setState({ currentPane: pane });
    }

    onChangeSchedule(schedule) {
        this.setState({ schedule });
    }

    onChangeSecrets(secrets) {
        this.setState({ secrets });
    }

    onChangeState(state) {
        this.strategy.onChangeState.call(this, state);
    }

    onClickRun() {
        this.run();
    }

    onClickSave() {
        this.save();
    }

    onSelectHistoryItem(item) {
        this.setState({ selectedHistoryItem: item });
    }

    onCronInspection(job) {
        this.setState({
            jobState: job.state,
            schedule: job.schedule,
            subject: job,
        });
    }

    onWebtaskInspection(claims) {
        this.setState({
            code: claims.code,
            mergeBody: !!claims.mb,
            name: claims.jtn || this.state.name,
            parseBody: !!claims.pb,
            secrets: claims.ectx || {},
        });
    }

    inspect() {
        this.inspection$ = this.props.cron
            ?   this.inspectCronJob()
            :   this.inspectWebtask();

        this.setState({ inspectionInProgress: true });

        return this.inspection$
            .catch(error => { this.setState({ error }); throw error; })
            .finally(() => this.setState({ inspectionInProgress: false }));
    }

    inspectCronJob() {
        const onCronJob = (job) => {
            const inspectionOptions = {
                decrypt: true,
                fetch_code: true
            };

            return job.inspect(inspectionOptions)
                .tap(this.onWebtaskInspection.bind(this));
        };

        return this.props.sandbox.getCronJob({ name: this.props.edit })
            .tap(onCronJob)
            .tap(this.onCronInspection.bind(this));
    }

    inspectWebtask() {
        const inspectionOptions = {
            name: this.props.edit,
            decrypt: true,
            fetch_code: true
        };

        return this.props.sandbox.inspectWebtask(inspectionOptions)
            .tap(this.onWebtaskInspection.bind(this));
    }

    run() {
        const runImpl = () => {
            this.setState({ runInProgress: true, currentPane: LogsPane });
            let wtName = `${this.state.name}${this.state.useSuffixOnRun ? '-run' : ''}`;

            const webtaskOptions = {
                name: wtName,
                mergeBody: this.state.mergeBody,
                parseBody: this.state.parseBody,
                secrets: this.state.secrets,
            };

            return this.props.sandbox.create(this.state.code, webtaskOptions)
                .then(webtask => webtask.run({
                    method: 'get',
                    query: {
                        webtask_no_cache: 1,
                    },
                }))
                .tap((res) => {
                    const headers = res.header;
                    const auth0HeaderRx = /^x-auth0/;

                    for (let header in headers) {
                        if (auth0HeaderRx.test(header)) {
                            headers[header] = JSON.parse(headers[header]);
                        }
                    }

                    const data = {
                        data: {
                            headers: headers,
                            statusCode: res.status,
                            body: res.body || res.text,
                        },
                    };

                    if (this.refs.logs) {
                        this.refs.logs.push(data);
                    }

                    if (this.props.onRun) this.props.onRun(data);

                    return data;
                })
                .catch(error => { this.setState({ error }); throw error; })
                .finally(() => this.setState({ runInProgress: false }));
        };

        return this.inspected$
            .then(runImpl);
    }

    save() {
        const saveImpl = () => {
            const error = this.validate();
            const noop = () => undefined;

            if (error) {
                return this.setState({ error });
            }

            this.setState({ saveInProgress: true });

            return this.strategy.onSave.call(this)
                .tap(this.props.onSave || noop)
                .catch(error => { this.setState({ error }); throw error; })
                .finally(() => this.setState({ saveInProgress: false }));
        };

        return this.inspected$
            .then(saveImpl);
    }

    setStrategy(strategy) {
        if (this.strategy.onDeactivate) {
            this.strategy.onDeactivate();
        }

        this.strategy = strategy;

        if (this.strategy.onActivate) {
            this.strategy.onActivate();
        }

        this.forceUpdate();
    }

    validate() {
        const name = this.state.name.trim();

        if (!name.match(/^[-_\.a-zA-Z0-9]+$/)) {
            return new Error('Invalid name: Webtask names must contain alphanumeric characters.');
        }
    }
}

WebtaskEditor.propTypes = {
    backButton: React.PropTypes.node,
    code: React.PropTypes.string,
    cron: React.PropTypes.bool,
    edit: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.instanceOf(Sandbox.CronJob),
        React.PropTypes.instanceOf(Sandbox.Webtask),
    ]),
    jobState: React.PropTypes.oneOf(['active', 'inactive']),
    mergeBody: React.PropTypes.bool,
    name: React.PropTypes.string,
    onRun: React.PropTypes.func,
    onSave: React.PropTypes.func,
    pane: React.PropTypes.string,
    parseBody: React.PropTypes.bool,
    sandbox: React.PropTypes.instanceOf(Sandbox).isRequired,
    schedule: React.PropTypes.string,
    secrets: React.PropTypes.object,
    stack: React.PropTypes.instanceOf(ComponentStack).isRequired,
    urlInfo: React.PropTypes.shape({
        copyButton: React.PropTypes.bool,
        prefix: React.PropTypes.string,
        readonly: React.PropTypes.bool,
    }),
    useSuffixOnRun: React.PropTypes.bool
};

WebtaskEditor.defaultProps = {
    cron: false,
    jobState: 'inactive',
    name: Genid(10),
    schedule: '',
    secrets: {},
};
