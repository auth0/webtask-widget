import Cron from 'cron-parser';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import CronEditor from './cronEditor';
import ToggleButton from 'components/toggleButton';

export default class ScheduleEditor extends React.Component {
    constructor(props) {
        super(props);
        
        const now = new Date();
        const frequencyMetric = 'mins';
        const frequencyValue = 10;
        
        this.state = {
            advanced: !!props.schedule,
            schedule: props.schedule || this.createIntervalSchedule(now, frequencyMetric, frequencyValue),
            frequencyValue,
            frequencyMetric,
            cronJob: props.cronJob,
            now: now,
            currentDate: now,
        };
    }
    
    componentDidMount() {
        this.nowInterval = setInterval(() => this.setState({ now: new Date() }), 1000 * 60);
        
        // Report any default schedule settings to parent
        this.onChangeSchedule(this.state.schedule);
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
                currentDate: this.state.currentDate,
            });
            const next = cron.next();
            const startOfToday = new Date(state.now.valueOf());
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
        
        const metrics = Object.keys(ScheduleEditor.frequencyMetrics);
        const allowed = ScheduleEditor.frequencyMetrics[state.frequencyMetric].allowed;
        const frequencyValueLabel = allowed[state.frequencyValue];
        const jobState = props.cronJob
            ?   props.cronJob.state
            :   'disabled';
        
        return (
            <div className="a0-schedule-pane">
                <div className="a0-schedule-display">
                    { nextRun
                    ?   (
                            <div className="a0-next-run">
                                <span className="a0-inline-text -inverted -bright">Next run { state.cronJob && state.cronJob.state === 'active' ? 'will' : 'would' } be&nbsp;</span>
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
                        disabled={ jobState !== 'active' && jobState !== 'inactive' }
                        loading={ props.stateChangePending }
                        checked={ jobState === 'active' }
                        onChange={ checked => this.onChangeState(!checked) }
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
    
    createIntervalSchedule(d, frequencyMetric, frequencyValue) {
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
        const nowSchedule = [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
        const metric = ScheduleEditor.frequencyMetrics[frequencyMetric];
        const freeze = typeof metric.freeze === 'undefined'
            ?   metric.offset
            :   metric.freeze;
        
        const schedule = metric
            ?   nowSchedule.map((curr, pos) =>
                    pos === metric.offset
                        ?   metric.encode(curr, frequencyValue, metric)
                        :   pos > freeze
                            ?   '*'
                            :   curr
                )
            :   nowSchedule;
        
        return schedule.join(' ');
    }
    
    getValue() {
        return this.state.schedule;
    }
    
    onChangeFrequencyMetric(frequencyMetric) {
        const metric = ScheduleEditor.frequencyMetrics[frequencyMetric];
        const currentDate = new Date();
        
        if (!metric) return;
        
        let frequencyValue = this.state.frequencyValue;
        
        if (!metric.allowed[frequencyValue]) {
            frequencyValue = Object.keys(metric.allowed)[0];
        }
        
        const schedule = this.createIntervalSchedule(currentDate, frequencyMetric, frequencyValue);
        
        this.setState({ frequencyMetric, frequencyValue, currentDate, schedule }, () => {
            if (this.props.onChangeSchedule) this.props.onChangeSchedule(this.getValue());
        });
    }
    
    onChangeFrequencyValue(frequencyValue) {
        const currentDate = new Date();
        const schedule = this.createIntervalSchedule(currentDate, this.state.frequencyMetric, frequencyValue);
        
        this.setState({ frequencyValue, currentDate, schedule }, () => {
            if (this.props.onChangeSchedule) this.props.onChangeSchedule(this.getValue());
        });
    }
    
    onChangeSchedule(schedule) {
        const currentDate = new Date();
        
        this.setState({ schedule, currentDate }, () => {
            this.props.onChangeSchedule(this.getValue());
        });
    }
    
    onChangeState(state) {
        const newState = state ? 'active' : 'inactive';
        
        console.log('onChangeState', state, newState);
        
        this.props.onChangeState(newState);
    }
}

ScheduleEditor.frequencyMetrics = {
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
        freeze: 1,
        encode: (curr, frequencyValue, metric) => frequencyValue,
    },
};

ScheduleEditor.propTypes = {
    schedule: React.PropTypes.string,
    onChangeSchedule: React.PropTypes.func.isRequired,
    onChangeState: React.PropTypes.func.isRequired,
    schedule: React.PropTypes.string,
    state: React.PropTypes.oneOf(['active', 'inactive', 'invalid', 'expired']),
    stateChangePending: React.PropTypes.bool,
};

ScheduleEditor.defaultProps = {
    schedule: '',
    state: 'inactive',
    stateChangePending: false,
};
