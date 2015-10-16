import React from 'react';

import Alert from '../components/alert';

export default class A0Logs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            logs: []
        };
    }

    componentDidMount() {
        const logStream = this.props.profile.createLogStream();

        logStream.on('error', (e) => {
            console.error(e);

            this.setState({
                error: new Error(e.message),
            });
        });

        logStream.on('data', (msg) => {
            const logs = this.state.logs.slice();

            if (msg.name === 'sandbox-logs') {
                logs.push(msg);
                logs.sort((a, b) => new Date(b) - new Date(a));

                this.setState({ logs });
            }
        });
    }

    render() {
        const error = this.state.error ?
                     'Error: ' + this.state.error.message :
                     null;

        const logs = this.state.logs.length ?
            <pre className="well">
                {
                    this.state.logs.map(line => line.msg + '\n')
                }
            </pre> :
            <Alert bsStyle="info">
                Nothing to report
            </Alert>

        return (
            <div className="a0-logs">
                <Alert bsStyle={this.state.error ? 'danger' : 'success'}>
                  {error || 'Connected to ' + this.props.profile.container}
                </Alert>

                {this.state.error ? null : logs}
            </div>
        );
    }
}

A0Logs.title = 'View webtask logs';

A0Logs.propTypes = {
    profile: React.PropTypes.object.isRequired
};
