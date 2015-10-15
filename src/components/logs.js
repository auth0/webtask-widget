import React from 'react';
import {Panel} from 'react-bootstrap';

export default class A0Logs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      logs: []
    };

    if(!props.webtask)
      this.state.error = 'Must supply webtask to inspect'
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

    const panelBody = !this.state.logs.length ?
        <p>Nothing to report</p> :
        <div>
            <pre className="a0-logs well">
                {
                    this.state.logs.map(line => line.msg + '\n')
                }
            </pre>
        </div>

    return (
      <Panel header={panelHeader}>
        {panelBody}
      </Panel>
    );
  }
}
