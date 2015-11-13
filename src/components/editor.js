import Cron from 'cron-parser';
import Debounce from 'lodash.debounce';
import Genid from 'genid';
import React from 'react';
import Sandbox from 'sandboxjs';

import {DropdownButton, MenuItem} from 'react-bootstrap';
import ReactZeroClipboard from 'react-zeroclipboard';

import AceEditor from '../components/ace';
import Alert from '../components/alert';
import Button from '../components/button';
import CronEditor from '../components/cronEditor';
import EditorOptions from '../components/editorOptions';
import Input from '../components/input';
import Logs from '../components/logs';
import SecretsEditor from '../components/secretsEditor';
import ToggleButton from '../components/toggleButton';
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
                <A0SchedulePane
                    ref="schedule"
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
    
    componentDidMount() {
        if (this.props.autoSaveOnLoad) this.saveWebtask();
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
        const webtaskUrl = props.profile.url + '/api/run/' + props.profile.container + '/' + state.name;
        
        const copyButton = this.state.webtask
            ?   (
                    <ReactZeroClipboard text={ webtaskUrl }>
                        <button className="a0-icon-button -copy"></button>
                    </ReactZeroClipboard>
                )
            :   (
                    <button disabled className="a0-icon-button -copy"></button>
                );

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
                        { copyButton }
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
                    query: {
                        webtask_no_cache: 1,
                    },
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


class A0SchedulePane extends React.Component {
    constructor(props) {
        super(props);
        
        const now = new Date();
        
        this.state = {
            advanced: !!props.schedule,
            schedule: props.schedule,
            frequencyValue: 10,
            frequencyMetric: 'mins',
            state: 'inactive',
            now: now,
            currentDate: now,
        };
    }
    
    componentDidMount() {
        this.nowInterval = setInterval(() => this.setState({ now: new Date() }), 1000 * 60);
    }
    
    componentWillUnmount() {
        clearInterval(this.nowInterval);
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const schedule = this.getValue();
        let nextRun;
        
        try {
            const cron = Cron.parseExpression(schedule, {
                currentDate: this.state.now,
            });
            const next = cron.next();
            const startOfToday = new Date(state.currentDate.valueOf());
            const days = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
            
            startOfToday.setHours(0);
            startOfToday.setMinutes(0);
            startOfToday.setSeconds(0);
            startOfToday.setMilliseconds(0);
            
            const deltaMinutes = (next.valueOf() - startOfToday.valueOf()) / (1000 * 60);
            let day;
            
            if (deltaMinutes < 60 * 24) {
                day = 'today';
            } else if (deltaMinutes < 60 * 24 * 2) {
                day = 'tomorrow';
            } else if (deltaMinutes < 60 * 24 * 7) {
                day = 'this ' + days[next.getDay()];
            } else if (deltaMinutes < 60 * 24 * 7 * 2) {
                day = 'next ' + days[next.getDay()];
            } else {
                day = 'in ' + Math.floor(deltaMinutes / (60 * 24)) + ' days';
            }
            
            nextRun = {
                day: day,
                time: next.toLocaleTimeString().replace(':00 ', ' '), // Strip seconds
            };
            
        } catch (e) { }
        
        const metrics = Object.keys(A0SchedulePane.frequencyMetrics);
        const allowed = A0SchedulePane.frequencyMetrics[state.frequencyMetric].allowed;
        const frequencyValueLabel = allowed[state.frequencyValue];
        
        return (
            <div className="a0-schedule-pane">
                <div className="a0-schedule-display">
                    { nextRun
                    ?   (
                            <div className="a0-next-run">
                                <span className="a0-inline-text -inverted -bright">Next run will be&nbsp;</span>
                                <span className="a0-inline-text -inverted -primary">{ nextRun.day }</span>
                                <span className="a0-inline-text -inverted -bright">&nbsp;at&nbsp;</span>
                                <span className="a0-inline-text -inverted -primary">{ nextRun.time }</span>
                            </div>
                        )
                    :   (
                            <div className="a0-next-run">
                                <span className="a0-inline-text -inverted -bright">This job will not run in the future</span>
                            </div>
                        )
                    }
                    <ToggleButton
                        ref="state"
                        disabled={ state.state !== 'active' && state.state !== 'inactive' }
                        checked={ state.state === 'active' }
                        onChange={ e => this.setState({ state: e.target.checked ? 'active' : 'inactive' }) }
                    />
                </div>
                <div className="a0-schedule-editor" disabled={ state.advanced }>
                    <span className="a0-inline-text -inverted -bright">Run this every</span>
                    { Object.keys(allowed).length > 1
                    ?   (
                            <DropdownButton
                                className="a0-value"
                                bsStyle="link"
                                disabled={ state.advanced }
                                noCaret={ false }
                                title={ frequencyValueLabel }
                                onSelect={ (e, frequencyValue) => this.onChangeFrequencyValue(frequencyValue) }
                                id="frequencyValue"
                            >
                                {
                                    Object.keys(allowed).map(i => (
                                        <MenuItem
                                            eventKey={ i }
                                            key={ i }
                                            active={ state.frequencyValue === i }
                                        >{ allowed[i] }</MenuItem>
                                    ))
                                }
                            </DropdownButton>
                        )
                    :   null
                    }
                    <DropdownButton
                        className="a0-metric"
                        bsStyle="link"
                        disabled={ state.advanced }
                        noCaret={ false }
                        title={ state.frequencyMetric }
                        onSelect={ (e, frequencyMetric) => this.onChangeFrequencyMetric(frequencyMetric) }
                        id="frequencyMetric"
                    >
                        {
                            metrics.map(value => (
                                <MenuItem
                                    eventKey={ value }
                                    key={ value }
                                    active={ state.frequencyMetric === value }
                                >{ value }</MenuItem>
                            ))
                        }
                    </DropdownButton>
                </div>
                <div className="a0-advanced-cron">
                    <label>
                        <input className="a0-toggle" type="checkbox"
                            checked={ state.advanced }
                            onChange={ e => this.setState({ advanced: e.target.checked }) }
                        />
                        <span className="a0-label -inverted -bright">Write an advanced schedule</span>
                    </label>
                </div>
                <CronEditor
                    ref="schedule"
                    value={ schedule }
                    disabled={ !state.advanced }
                    onChange={ (schedule) => this.onChangeSchedule(schedule) }
                />
            </div>
        );
    }
    
    createIntervalSchedule() {
        // How does this work, you may ask
        //
        // First, we build a cron string array that corresponds to right now.
        // Next, the complex ternary works as follows:
        // 1.  If the current position in the cron string array is higher than the current
        //     metric's offset, this means that no schedule should be enforced at this
        //     position, so we return a '*'
        // 2.  If the current position in the cron string array is lower than the current
        //     metric's offset, we leave that part of the cron string as is because it
        //     represents 'right now'
        // 3.  Otherwise, we want to build a list of hour/minute offsets that correspond to 
        //     intervals of `frequencyValue` units of `frequencyMetric` from the current time.
        const d = this.state.currentDate;
        const nowSchedule = [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
        const frequencyMetric = this.state.frequencyMetric;
        const frequencyValue = this.state.frequencyValue;
        const metric = A0SchedulePane.frequencyMetrics[frequencyMetric];
        
        const schedule = metric
            ?   nowSchedule.map((curr, pos) =>
                    pos > metric.offset
                        ?   '*'
                        :   pos < metric.offset
                            ?   curr
                            :   metric.encode(curr, frequencyValue, metric)
                )
            :   nowSchedule;
        
        return schedule.join(' ');
    }
    
    getValue() {
        return this.state.advanced
            ?   this.state.schedule
            :   this.createIntervalSchedule()
    }
    
    onChangeFrequencyMetric(frequencyMetric) {
        const metric = A0SchedulePane.frequencyMetrics[frequencyMetric];
        const currentDate = new Date();
        
        if (!metric) return;
        
        let frequencyValue = this.state.frequencyValue;
        
        if (!metric.allowed[frequencyValue]) {
            frequencyValue = Object.keys(metric.allowed)[0];
        }
        
        this.setState({ frequencyMetric, frequencyValue, currentDate }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
    
    onChangeFrequencyValue(frequencyValue) {
        const currentDate = new Date();
        
        this.setState({ frequencyValue, currentDate }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
    
    onChangeSchedule(schedule) {
        const currentDate = new Date();
        
        this.setState({ schedule, currentDate }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
}

A0SchedulePane.frequencyMetrics = {
    'mins': {
        max: 60,
        allowed: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 10: 10, 15: 15, 20: 20, 30: 30 },
        offset: 0,
        encode: (curr, frequencyValue, metric) => {
            const mod = curr % frequencyValue;
            
            return mod > 0
                ?   `${curr % frequencyValue}-${metric.max - 1}/${frequencyValue}`
                :   `*/${frequencyValue}`;
        },
    },
    'hours': {
        max: 24,
        allowed: { 1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 8: 8, 12: 12 },
        offset: 1,
        encode: (curr, frequencyValue, metric) => {
            const mod = curr % frequencyValue;
            
            return mod > 0
                ?   `${curr % frequencyValue}-${metric.max - 1}/${frequencyValue}`
                :   `*/${frequencyValue}`;
        },
    },
    'day': {
        max: 7,
        allowed: { 1: 'once' },
        offset: 2,
        encode: (curr, frequencyValue, metric) => '*',
    },
    'weekly': {
        max: 7,
        allowed: { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' },
        offset: 4,
        encode: (curr, frequencyValue, metric) => frequencyValue,
    },
};

A0SchedulePane.propTypes = {
    // schedule: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    schedule: React.PropTypes.string,
};

A0SchedulePane.defaultProps = {
    schedule: '',
};
