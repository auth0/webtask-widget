import React from 'react';
import EventSource from 'event-source-stream';

export default class A0Logs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            logs: []
        };
    }

    componentDidMount() {
        const { url, container, token } = this.props.profile;

        const streamUrl = url + '/api/logs/tenant/'
            + container
            + '?key=' + token;

        const logStream = EventSource(streamUrl, { json: true });

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
        const logs = !this.state.logs.length ?
            <p>Nothing to report</p> :
            <pre className="a0-logs well">
                {
                    this.state.logs.map(line => line.msg + '\n')
                }
            </pre>

        return (
            <div>
                {this.state.error || logs}
            </div>
        );
    }
}

A0Logs.title = 'View webtask logs';

A0Logs.propTypes = {
    profile: React.PropTypes.object.isRequired
};
