import React from 'react';
import Sandbox from 'sandboxjs';

import ComponentStack from '../lib/componentStack';
import normalizeCronResult from '../lib/normalizeCronResult';

import Alert from '../components/alert';
import Button from '../components/button';
import Inspector from 'react-json-inspector';

import '../styles/cronView.less';


export default class A0CronJobView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            job: props.job,
            error: null,
            destroyingJob: false,
            loadingJob: false,
        };
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.loadingJob
            || this.destroyingJob;
        const job = state.job;
        const thStyle = {
            width: '20%',
        };
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
        ?   normalizeCronResult(job.results[0])
        :   null;
        const onClickBack = this.props.reject.bind(null, new Error('User clicked back button.'));
        const onClickViewHistory = e => e.preventDefault() + this.viewJobJistory();
        const onClickDestroy = e => e.preventDefault()
            + (
                confirm('Are you sure you would like to delete this job?\n\nDeleting the job will not destroy the webtask; it will only stop the webtask from being executed on a schedule.')
                && this.destroyJob()
            );
        
        return (
            <div className="a0-cronview">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
                <table className="table">
                    <tbody>
                        <tr>
                            <th style={ thStyle }>Job name</th>
                            <td>{ job.name }</td>
                        </tr>
                        <tr>
                            <th style={ thStyle }>Created at</th>
                            <td>{ new Date(job.created_at).toLocaleString() }</td>
                        </tr>
                        <tr>
                            <th style={ thStyle }>Next run</th>
                            <td>{ new Date(job.last_scheduled_at || job.next_available_at).toLocaleString() }</td>
                        </tr>
                        <tr>
                            <th style={ thStyle }>State</th>
                            <td>
                                <span className={ `label ${stateClasses[job.state]}` }>{ job.state }</span>
                            </td>
                        </tr>
                        { lastResult
                        ?   (
                                <tr>
                                    <th style={ thStyle }>Last result</th>
                                    <td>
                                        <Inspector className="well" data={ lastResult } search={ null } />
                                    </td>
                                </tr>
                            )
                        : null
                        }
                    </tbody>
                </table>
                
                <div className="btn-list text-right clearfix">
                    <Button
                        className="pull-left"
                        type="button"
                        onClick={ onClickBack }>
                        Back
                    </Button>
                    <Button
                        bsStyle="danger"
                        type="button"
                        onClick={ onClickDestroy }>
                        Delete
                    </Button>
                    <Button
                        bsStyle="primary"
                        type="button"
                        onClick={ onClickViewHistory }>
                        Browse history
                    </Button>
                </div>
            </div>
        );
    }
    
    destroyJob() {
        this.setState({ destroyingJob: false });
        
        this.props.profile.removeCronJob({ name: this.props.job.name })
            .then(job => this.props.reject(new Error('User destroyed job.')))
            .catch(error => this.setState({ destroyingJob: false, error }));
    }
    
    refreshJob() {
        this.setState({ loadingJob: false });
        
        this.props.profile.getCronJob({ name: this.props.job.name })
            .then(job => this.setState({ job }))
            .catch(error => this.setState({ error }))
            .finally(() => this.setState({ loadingJob: false }));
    }
    
    viewJobJistory(e) {
        if (e) e.preventDefault();
        
        alert(`WIP: viewJobHistory('${this.props.job.name}')`);
    }
}

A0CronJobView.propTypes = {
    componentStack:         React.PropTypes.instanceOf(ComponentStack).isRequired,
    profile:                React.PropTypes.instanceOf(Sandbox).isRequired,
    job:                    React.PropTypes.object.isRequired,
};

A0CronJobView.defaultProps = {
};
