import React from 'react';
import Sandbox from 'sandboxjs';
import TimeAgo from 'react-timeago';

import ComponentStack from '../lib/componentStack';

import Alert from '../components/alert';
import Button from '../components/button';
import CronView from '../components/cronView';
import ToggleButton from '../components/toggleButton';


import { A0EditorWidget } from '../widgets/editor';

import '../styles/cronList.less';


export default class A0CronJobList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            loadingJobs: false,
            inspectingJob: false,
            jobs: [],
        };
    }
    
    componentDidMount() {
        this.refreshJobs();
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.loadingJobs || state.inspectingJob;
        
        const loadingBody = (
            <tbody className="a0-conlist-loading">
                <tr>
                    <td className="a0-cronlist-colspan" colSpan="99">Loading cron jobs...</td>
                </tr>
            </tbody>
        );
        
        return (
            <div className="a0-cron-list">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
                <table className="a0-vertical-table -striped -hover">
                    <thead>
                        <tr>
                            <th>Job name</th>
                            <th>Created</th>
                            <th>State</th>
                            <th>Next Run</th>
                            <th>Last result</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    { loading
                    ?   loadingBody
                    :   (
                            <tbody>
                                { state.jobs && state.jobs.length
                                ?   state.jobs.map((job, index) => 
                                        <A0CronJobRow
                                            key={ job.name } 
                                            job={ job }
                                            disabled={ loading }
                                            onClick={ job => this.editJob(job) }
                                            onClickDestroy={ job => this.onDeleteJob(job) }
                                            onChangeState={ (job, state) => this.onChangeJobState(job, state) }
                                            removeCronJob={ props.profile.removeCronJob.bind(props.profile) }
                                        />
                                    )
                                :   (
                                        <tr className="a0-cronlist-empty">
                                            <td className="a0-cronlist-colspan" colSpan="99">
                                                No jobs found.
                                                
                                                <Button
                                                    bsStyle="link"
                                                    bsSize="sm"
                                                    onClick={ e => this.refreshJobs() }
                                                >Refresh</Button>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        )
                    }
                </table>
                <div className="btn-list">
                    <button
                        className="a0-inline-button"
                        disabled={ loading }
                        onClick={ e => loading ? null : this.refreshJobs() }
                    >
                        { state.loadingJobs
                        ?   'Refreshing...'
                        :   'Refresh'
                        }
                    </button>

                    { props.showCreateButton
                    ?   (
                            <button
                                className="a0-inline-button -primary"
                                onClick={ e => this.createJob() }
                            >
                                Create
                            </button>
                        )
                    : null
                    }
                </div>

            </div>
        );
    }
    
    createJob() {
        var editor = new A0EditorWidget(Object.assign({}, this.props, {
            createCronJob: true,
            onClickCancel: () => editor.destroy(),
            onClickSave: createCronJob.bind(this),
        }));
        
        function createCronJob(inst) {
            return editor.save()
                .then(webtask => webtask.createCronJob({
                    schedule: inst.state.schedule,
                }))
                .catch(e => this.setState({ error: e }))
                .finally(() => {
                    editor.destroy();
                    this.refreshJobs();
                });
        }
    }
    
    refreshJobs() {
        this.setState({ loadingJobs: true, error: null });
        
        return this.props.profile.listCronJobs()
            .tap((jobs) => this.setState({ jobs }))
            .catch((error) => this.setState({ error }))
            .finally(() => this.setState({ loadingJobs: false }));
    }
    
    editJob(job) {
        this.setState({
            inspectingJob: true,
        });
        
        job.inspect({
            fetch_code: true,
            decrypt: true,
        })
            .then(tokenData => {
                var editor = new A0EditorWidget(Object.assign({}, this.props, {
                    createCronJob: true,
                    schedule: job.schedule,
                    code: tokenData.code,
                    secrets: tokenData.ectx,
                    mergeBody: !!tokenData.mb,
                    parseBody: !!tokenData.pb,
                    name: job.name || tokenData.jtn,
                    pane: 'Schedule',
                    onClickCancel: () => editor.destroy(),
                    onClickSave: updateCronJob.bind(this),
                }));
                
                function updateCronJob(inst) {
                    return editor.save()
                        .then(webtask => webtask.createCronJob({
                            schedule: inst.state.schedule,
                        }))
                        .catch(e => this.setState({ error: e }))
                        .finally(() => {
                            editor.destroy();
                            this.refreshJobs();
                        });
                }
            })
            .catch(error => this.setState({ error }))
            .finally(() => this.refreshJobs(), this.setState({ inspectingJob: false }));
    }
    
    viewJob(job) {
        this.props.componentStack.push(CronView, Object.assign({}, this.props, { job }))
            .promise
            .catch(e => e)
            .finally(() => this.refreshJobs());
    }
    
    onDeleteJob(job) {
        if (confirm('Are you sure you want to delete this cron job?\n\n This action can not be undone.')) {
            const jobs = this.state.jobs.slice();
            const idx = this.state.jobs.indexOf(job);
            
            if (idx >= 0) {
                jobs.splice(idx, 1);
                this.setState({ jobs });
            }
            
            job.remove()
                .catch(error => this.setState({ error }));
        }
    }
    
    onChangeJobState(job, state) {
        job.setJobState({ state })
            .tap(() => {
                const jobs = this.state.jobs.slice();
                
                this.setState({ jobs });
            });
    }
}

A0CronJobList.propTypes = {
    componentStack:         React.PropTypes.instanceOf(ComponentStack).isRequired,
    profile:                React.PropTypes.instanceOf(Sandbox).isRequired,
    showCreateButton:       React.PropTypes.bool,
};

A0CronJobList.defaultProps = {
    showCreateButton:       true,
};

class A0CronJobRow extends React.Component {
    constructor() {
        super();

        this.state = {
            destroyingJob: false 
        };
    }
    destroyJob() {
        this.setState({ destroyingJob: true });
        
        this.props.removeCronJob({ name: this.props.job.name })
            .tap(() => this.setState({ destroyingJob: false }))
            .then(job => this.props.reject(new Error('User destroyed job.')))
            .catch(error => this.setState({ error }));
    }

    render() {
        const props = this.props;
        
        const job = props.job;
        const resultClasses = {
            success: '-success',
            error: '-danger',
        };
        const stateClasses = {
            active: '-success',
            invalid: '-danger',
            expired: '-warning',
        };
        const lastResult = job.results.length
        ?   job.results[0]
        :   null;

        const onClickRow = e => {
            // Stop inline buttons from triggering row click
            e.stopPropagation();

            if(e.target.tagName !== 'BUTTON')
                return props.onClick(this.props.job);
        };

        const onClickDestroy = e => {
            e.preventDefault();
            e.stopPropagation();

            if (this.props.onClickDestroy) this.props.onClickDestroy(this.props.job);
        }

        
        return (
            <tr className="a0-cronlist-job" disabled={ props.disabled } onClick={ onClickRow }>
                <td>{ job.name }</td>
                <td>
                    <TimeAgo
                        date={ job.created_at }
                    />
                </td>
                <td>
                    <ToggleButton
                        ref="state"
                        disabled={ job.state === 'expired' || job.state === 'invalid' }
                        checked={ job.state === 'active' }
                        onChange={ checked => this.onChangeState(checked) }
                    />
                </td>
                <td>
                    { job.state === 'expired'
                    ?   'Expired'
                    :   job.state === 'active'
                        ?   (
                                <TimeAgo
                                    date={ job.scheduled_at || job.next_available_at }
                                />
                            )
                        :   '-'
                    }
                </td>
                <td>
                    { lastResult
                    ?   (
                            <div>
                                <span className={ `a0-inline-text -sentence ${resultClasses[lastResult.type]}` }>{ lastResult.type }</span>
                            </div>
                        )
                    : "&emdash;"
                    }
                </td>
                <td>
                    <button
                        className="a0-row-delete"
                        type="button"
                        onClick={ onClickDestroy }
                    >
                        &times;
                    </button>
                </td>
            </tr>
        );
    }
    
    onChangeState(state) {
        const newState = state ? 'active' : 'inactive';
        
        if (this.props.onChangeState) this.props.onChangeState(this.props.job, newState);
    }
}
