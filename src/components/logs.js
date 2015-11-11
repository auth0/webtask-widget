import React from 'react';
import Sandbox from 'sandboxjs';

import Alert from '../components/alert';
import Inspector from 'react-object-inspector';

import '../styles/logs.less';

export default class A0Logs extends React.Component {
    constructor(props) {
        super(props);

        this.logStream = null;
        this.state = {
            logs: Array.isArray(props.logs) ? props.logs.slice() : [],
        };
    }

    componentDidMount() {
        this.logStream = this.props.profile.createLogStream();
        
        this.logStream.on('open', (e) => {
            this.push({
                msg: 'Connected to ' + this.props.profile.container,
                className: '-success',
            });
        });

        this.logStream.on('error', (e) => {
            this.push({
                msg: e.message,
                className: '-danger',
            });
            
            if (this.props.onError) this.props.onError(e);
        });

        this.logStream.on('data', (event) => {
            if (event.name === 'sandbox-logs') {
                if (event.msg.match(/^webtask container (assigned|recycled)$/)) {
                    event.className = '-muted';
                }
                
                event.time = new Date(event.time);
                
                this.push(event);
                
                if (this.props.onMessage) this.props.onMessage(event.msg);
            }
            
            if (this.props.onEvent) this.props.onEvent(event);
        });
    }

    componentDidUpdate() {
        // if(this.refs['log-view']) {
        //     let logs = this.refs['log-view'];

        //     logs.scrollTop = logs.scrollHeight;
        // }
    }
    
    componentWillUnmount() {
        this.logStream.destroy();
        this.logStream = null;
    }

    render() {
        const theme = {
            scheme: 'monokai',
            author: 'wimer hazenberg (http://www.monokai.nl)',
            base00: '#272822',
            base01: '#383830',
            base02: '#49483e',
            base03: '#75715e',
            base04: '#a59f85',
            base05: '#f8f8f2',
            base06: '#f5f4f1',
            base07: '#f9f8f5',
            base08: '#f92672',
            base09: '#fd971f',
            base0A: '#f4bf75',
            base0B: '#a6e22e',
            base0C: '#a1efe4',
            base0D: '#66d9ef',
            base0E: '#ae81ff',
            base0F: '#cc6633'
        };
        
        return (
            <div className="a0-logs">
                {
                    this.state.logs.map((line, i) => (
                        <span key={i} className={ 'a0-inline-text -inverted ' + line.className }>
                            { line.data
                            ?   <Inspector data={ line.data } name="result" />
                            :   line.time.toISOString() + ': ' + line.msg + '\n'
                            }
                        </span>
                    ))
                }
            </div>
        );
    }
    
    push(event) {
        const logs = this.state.logs.slice();
        
        if (!event.time) event.time = new Date();
        
        logs.push(event);
        
        this.setState({ logs });
    }
    
    clear() {
        this.setState({
            logs: [],
        });
    }
}

A0Logs.title = 'View webtask logs';

A0Logs.propTypes = {
    profile: React.PropTypes.instanceOf(Sandbox).isRequired,
    onMessage: React.PropTypes.func,
    onEvent: React.PropTypes.func,
    onError: React.PropTypes.func,
};
