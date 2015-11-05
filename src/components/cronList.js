import React from 'react';
import Sandbox from 'sandboxjs';

import ComponentStack from '../lib/componentStack';

import Alert from '../components/alert';
import Button from '../components/button';
import CronView from '../components/cronView';
import Editor from '../components/editor';

import '../styles/cronList.less';


export default class A0CronJobList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            loadingJobs: false,
            jobs: [],
        };
    }
    
    componentDidMount() {
        this.refreshJobs();
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.loadingJobs;
        const createJob = this.createJob.bind(this);
        const refreshJobs = this.refreshJobs.bind(this);
        const viewJob = job => e => this.viewJob(e, job);
        
        const loadingBody = (
            <tbody className="a0-conlist-loading">
                <tr>
                    <td className="a0-cronlist-colspan" colSpan="99">Loading cron jobs...</td>
                </tr>
            </tbody>
        );
        
        return (
            <div className="a0-cronlist">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
                <div className="btn-list">
                    <Button
                        disabled={ loading }
                        onClick={ loading ? null : refreshJobs }
                    >
                        { state.loadingJobs
                        ?   'Refreshing...'
                        :   'Refresh'
                        }
                    </Button>

                    { props.showCreateButton
                    ?   (
                            <Button
                                bsStyle="primary"
                                onClick={ createJob }
                            >
                                Create
                            </Button>
                        )
                    : null
                    }
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Job name</th>
                            <th>Created at</th>
                            <th>Next run</th>
                            <th>State</th>
                            <th>Last result</th>
                        </tr>
                    </thead>
                    { loading
                    ?   loadingBody
                    :   (
                            <tbody>
                                { state.jobs && state.jobs.length
                                ?   state.jobs.map((job, index) => <A0CronJobRow
                                                                key={ job.name } 
                                                                job={ job } 
                                                                onClick={ viewJob(job) } 
                                                                removeCronJob={ props.profile.removeCronJob.bind(props.profile) }
                                                                reject={ () => refreshJobs() } />)
                                :   (
                                        <tr className="a0-cronlist-empty">
                                            <td className="a0-cronlist-colspan" colSpan="99">
                                                No jobs found.
                                                
                                                <Button
                                                    bsStyle="link"
                                                    bsSize="sm"
                                                    onClick={ refreshJobs }
                                                >Refresh</Button>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        )
                    }
                </table>
            </div>
        );
    }
    
    createJob(e) {
        if (e) e.preventDefault();
        
        this.props.componentStack.push(Editor, Object.assign({}, this.props, {
            
        }))
            .promise
            .catch(error => this.setState({ error }))
            .finally(() => this.refreshJobs());
        
        // this.props.componentStack.push();
        
        alert('WIP: createJob()');
    }
    
    refreshJobs(e) {
        if (e) e.preventDefault();
        
        this.setState({ loadingJobs: true, jobs: [], error: null });
        
        return this.props.profile.listCronJobs()
            .tap((jobs) => this.setState({ jobs }))
            .catch((error) => this.setState({ error }))
            .finally(() => this.setState({ loadingJobs: false }));
    }
    
    viewJob(e, job) {
        if (e) e.preventDefault();
        
        this.props.componentStack.push(CronView, Object.assign({}, this.props, { job }))
            .promise
            .catch(e => e)
            .finally(() => this.refreshJobs());
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
            success: 'label-success',
            error: 'label-danger',
        };
        const stateClasses = {
            active: 'label-success',
            invalid: 'label-danger',
            expired: 'label-warning',
        };
        const lastResult = job.results.length
        ?   job.results[0]
        :   null;

        const onClickRow = e => {
            // Stop inline buttons from triggering row click
            e.stopPropagation();

            if(e.target.tagName !== 'BUTTON')
                return props.onClick(e);
        };

        const onClickDestroy = e => {
            e.preventDefault()

            confirm('Are you sure you would like to delete this job?\n\n' +
                    'Deleting the job will not destroy the webtask; it will only stop the webtask from being executed on a schedule.')
            && this.destroyJob();
        }

        
        return (
            <tr className="a0-cronlist-job" onClick={ onClickRow }>
                <td>{ job.name }</td>
                <td>{ new Date(job.created_at).toLocaleString() }</td>
                <td>{ new Date(job.last_scheduled_at || job.next_available_at).toLocaleString() }</td>
                <td>
                    <span className={ `label ${stateClasses[job.state]}` }>{ job.state }</span>
                </td>
                <td>
                    { lastResult
                    ?   (
                            <div>
                                <span className={ `label ${resultClasses[lastResult.type]}` }>{ lastResult.type }</span>
                            </div>
                        )
                    : null
                    }
                </td>
                <td>
                    <Button
                        bsSize="xsmall"
                        bsStyle="danger"
                        type="button"
                        onClick={ onClickDestroy }>
                        { this.state.destroyingJob ?
                            'Deleting...' :
                            'Delete'
                            
                        }
                    </Button>
                </td>
            </tr>
        );
    }
}
