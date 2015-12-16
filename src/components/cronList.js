import CronListRow from 'components/cronListRow';
import Editor from 'components/editor';
import ComponentStack from 'lib/componentStack';
import React from 'react';
import Sandbox from 'sandboxjs';

import 'styles/cronList.less';


export default class CronList extends React.Component {
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
        const errorMessage = this.state.error
            ?   (
                    <tbody>
                        <tr className="a0-error-row">
                            <td className="a0-error-message" colSpan={ 99 }>
                                { this.state.error.message }
                            </td>
                        </tr>
                    </tbody>
                )
            :   null;
        
        const loadingBody = (
            <tbody className="a0-cronlist-loading">
                <tr>
                    <td className="a0-cronlist-colspan" colSpan="99">Loading cron jobs...</td>
                </tr>
            </tbody>
        );
        
        const emptyBody = (
            <tbody className="a0-cronlist-empty">
                <tr>
                    <td className="a0-cronlist-colspan" colSpan="99">
                        <button className="a0-icon-button -refresh"
                            onClick={ e => this.refreshJobs() }
                        >
                            Refresh
                        </button>
                        No scheduled jobs were found.
                    </td>
                </tr>
            </tbody>
        );
        
        const tableBody = this.state.jobs.length === 0
            ?   this.state.loadingJobs
                ?   loadingBody
                :   emptyBody
            :   (
                    <tbody className="a0-cronlist-listing">
                        {
                            this.state.jobs.map(job => (
                                <CronListRow key={ job.name }
                                    createdAt={ job.created_at }
                                    disabled={ this.state.inspectingJob }
                                    lastResult={ job.results && job.results[0] }
                                    name={ job.name }
                                    nextAvailableAt={ job.next_available_at }
                                    onClick={ () => this.onClickJob(job) }
                                    onClickDestroy={ () => this.onClickDestroy(job) }
                                    onChangeState={ (state) => this.onChangeJobState(job, state) }
                                    onScheduledRun={ () => this.onScheduledRun(job) }
                                    state={ job.state }
                                    stateChangeInProgress={ !!job.stateChangeInProgress }
                                />
                            ))
                        }
                    </tbody>
                );
        
        const createButton = this.props.showCreateButton
            ?   (
                    <button
                        className="a0-inline-button -success"
                        onClick={ e => this.onClickCreate() }
                    >
                        Create
                    </button>
                )
            : null;

        
        return (
            <div className="a0-cron-widget">
                <table className="a0-cron-listing">
                    <thead>
                        <tr>
                            <th>Job name</th>
                            <th>Created</th>
                            <th>State</th>
                            <th>Next Run</th>
                            <th>Last result</th>
                        </tr>
                    </thead>
                    { errorMessage }
                    { tableBody }
                </table>
                <div className="a0-cron-actions">
                    { createButton }
                </div>
            </div>
        );
    }
    
    // Non-React API:
    
    onChangeJobState(job, state) {
        job.stateChangeInProgress = true;
        
        this.setState({ jobs: this.state.jobs.slice() });
        
        job.setJobState({ state })
            .finally(() => {
                job.stateChangeInProgress = false;
                
                this.setState({ jobs: this.state.jobs.slice() });
            });
    }
    
    onClickCreate() {
        const unmount = () => {
            editor.unmount();
            this.refreshJobs();
        };
        
        const backButton = (
            <button className="a0-icon-button -back"
                onClick={ unmount }
            >Back</button>
        );

        const editor = this.props.stack.push(Editor, {
            backButton,
            cron: true,
            sandbox: this.props.sandbox,
            mergeBody: false,
            onSave: unmount,
            parseBody: true,
        });
    }
    
    onClickDestroy(job) {
        if (confirm('Are you sure you want to delete this cron job?\n\n This action can not be undone.')) {
            const jobs = this.state.jobs.slice();
            const idx = this.state.jobs.indexOf(job);
            
            if (idx >= 0) {
                jobs.splice(idx, 1);
                this.setState({ jobs });
            }
            
            job.remove()
                .catch(error => {
                    const jobs = this.state.jobs.slice();
                    
                    jobs.splice(idx, 0, job);
                    
                    this.setState({ error, jobs });
                });
        }
    }
    
    onClickJob(job) {
        this.setState({
            inspectingJob: job,
        });
        
        job.inspect({
            fetch_code: true,
            decrypt: true,
        })
            .tap(tokenData => {
                const backButton = (
                    <button className="a0-icon-button -back"
                        onClick={ e => { editor.unmount(); this.refreshJobs(); } }
                    >Back</button>
                );
        
                const editor = this.props.stack.push(Editor, {
                    backButton,
                    code: tokenData.code,
                    cron: true,
                    edit: job,
                    name: job.name || tokenData.jtn,
                    sandbox: this.props.sandbox,
                    schedule: job.schedule,
                    secrets: tokenData.ectx,
                    mergeBody: !!tokenData.mb,
                    parseBody: !!tokenData.pb,
                });
            })
            .catch(error => this.setState({ error }))
            .finally(() => this.setState({ inspectingJob: null }));
    }
    
    onScheduledRun(job) {
        // TODO: Need a better strategy to determine when to refresh specific
        //       jobs since their actual run time is governed by the cron
        //       scheduler's interval.
        // job.refresh()
        //     .then(() => {
        //         const jobs = this.state.jobs.slice();
                
        //         this.setState({ jobs });
        //     });
    }
    
    // Public API
    
    refreshJobs() {
        this.setState({ loadingJobs: true, error: null });
        
        return this.props.sandbox.listCronJobs()
            .tap((jobs) => this.setState({ jobs }))
            .catch((error) => this.setState({ error }))
            .finally(() => this.setState({ loadingJobs: false }));
    }
}


CronList.propTypes = {
    sandbox: React.PropTypes.instanceOf(Sandbox).isRequired,
    showCreateButton: React.PropTypes.bool,
    stack: React.PropTypes.instanceOf(ComponentStack).isRequired,
};

CronList.defaultProps = {
    showCreateButton: true,
};