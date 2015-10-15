import React from 'react';

export default class A0Logs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            logs: []
        };
    }

    componentDidMount() {
        const logStream = this.props.webtask.createLogStream();

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

        this.logStream = logStream;
    }

    componentWillUnmount() {
        this.logStream.destroy();
    }

    render() {
        const panelHeader = 'Logs for ' + this.props.webtask.container;

        const logs = !this.state.logs.length ?
            <p>Nothing to report</p> :
            <pre className="a0-logs well">
                {
                    this.state.logs.map(line => line.msg + '\n')
                }
            </pre>

        return (
            <div>
                {this.state.error || panelBody}
            </div>
        );
    }
}

A0Logs.title = 'View webtask logs';

A0Logs.propTypes = {
    webtask: React.PropTypes.object.isRequired
};
