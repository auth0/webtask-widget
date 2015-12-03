import React from 'react';
import Sandbox from 'sandboxjs';

import ComponentStack from '../lib/componentStack';
import normalizeCronResult from '../lib/normalizeCronResult';

import Alert from '../components/alert';
import Button from '../components/button';
import A0Modal from '../components/modal';
import Inspector from 'react-json-inspector';

import '../styles/cronView.less';


export default class A0CronJobView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            job: props.job,
            jobHistory: [],
            error: null,
            destroyingJob: false,
            loadingJob: false,
        };
    }

    componentDidMount() {
        this.getHistory();
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
        const historyTypeClasses = {
            success: 'label-success',
            failure: 'label-danger',
        };
        const onClickBack = this.props.reject.bind(null, new Error('User clicked back button.'));
        const onClickDestroy = e => e.preventDefault()
            + (
                confirm('Are you sure you would like to delete this job?\n\nDeleting the job will not destroy the webtask; it will only stop the webtask from being executed on a schedule.')
                && this.destroyJob()
            );
        const inspect = history => {
            return e => {
                e.preventDefault();

                this.setState({ inspecting: history });
            }
        }
        
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
                <table className="table table-hover table-fixedheader">
                    <thead>
                        <tr>
                            <th style={ thStyle }>Started</th>
                            <th style={ thStyle }>Completed</th>
                            <th style={ thStyle }>Result</th>
                        </tr>
                    </thead>
                    <tbody> 
                        { this.state.jobHistory.map( (history, index) => (
                            <tr key={index} className="a0-cronview-historyitem" data-index={index} onClick={ inspect(history) }>
                                <td>
                                    { new Date(history.started_at).toLocaleString() }
                                </td>
                                <td>
                                    { new Date(history.completed_at).toLocaleString() }
                                </td>
                                <td>
                                    <span className={ `label ${historyTypeClasses[history.type]}` }>{ history.type }</span>
                                </td>
                            </tr>
                          ))
                        }
                    </tbody>
                </table>

                { this.state.inspecting ?
                    <A0Modal title="Response" onHide={inspect(null)}>
                        <Inspector className="well" data={ this.state.inspecting } search={ null }/>
                    </A0Modal>
                    : null
                }
                
                <div className="btn-list">
                    <Button
                        className="pull-left"
                        type="button"
                        onClick={ onClickBack }>
                        Back
                    </Button>
                </div>
            </div>
        );
    }
    
    refreshJob() {
        this.setState({ loadingJob: false });
        
        this.props.profile.getCronJob({ name: this.props.job.name })
            .then(job => this.setState({ job }))
            .catch(error => this.setState({ error }))
            .finally(() => this.setState({ loadingJob: false }));
    }

    getHistory(e) {
        if (e) e.preventDefault();

        this.props.job.getHistory()
            .then(history => this.setState({ jobHistory: history }))
            .catch(e => console.error(e));
    }
}

A0CronJobView.propTypes = {
    componentStack:         React.PropTypes.instanceOf(ComponentStack).isRequired,
    profile:                React.PropTypes.instanceOf(Sandbox).isRequired,
    job:                    React.PropTypes.object.isRequired,
};

A0CronJobView.defaultProps = {
};
