import React from 'react';
import Sandbox from 'sandboxjs';

import Inspector from 'react-object-inspector';

import 'styles/logs.less';

export default class Logs extends React.Component {
    constructor(props) {
        super(props);

        this.logStream = null;
        this.state = {
            error: null,
            logs: Array.isArray(props.logs) ? props.logs.slice() : [],
            reconnecting: false,
        };
    }

    componentDidMount() {
        this.reconnect();
    }

    componentWillUpdate() {
        var element = this.refs.lines;

        // Set scroll flag if we are within 20px of scroll bottom
        this.shouldScroll = Math.abs(element.scrollHeight - element.scrollTop - element.offsetHeight) < 20;
    }
    
    componentWillUnmount() {
        this.logStream.destroy();
        this.logStream = null;
    }
    
    componentDidUpdate() {
        var element = this.refs.lines;
        
        if (this.shouldScroll) {
            element.scrollTop = element.scrollHeight;
        }
    }

    render() {
        const error = this.state.error
            ?   (
                    <div className="a0-logs-error">
                        { this.state.error.message }
                        {   this.state.error.code === 'E_TIMEDOUT'
                            ?   (
                                    <button className="a0-reconnect-button" onClick={ e => this.onClickReconnect() }>Reconnect</button>
                                )
                            : null
                        }
                    </div>
                )
            :   null;
        
        const reconnecting = this.state.reconnecting
            ?   (
                    <div className="a0-logs-reconnecting">
                        { this.state.reconnecting }
                    </div>
                )
            :   null;
        
        return (
            <div className="a0-logs-widget">
                <div className="a0-logs-scroller">
                    <div className="a0-logs-lines" ref="lines">
                        {
                            this.state.logs.map((line, i) => (
                                <span key={i} className={ 'a0-inline-text -inverted ' + (line.className || '') }>
                                    { line.time.toLocaleTimeString() + ': ' }
                                    { line.data
                                    ?   (
                                            <div className="a0-inline-inspector">
                                                <Inspector data={ line.data } name="result" />
                                            </div>
                                        )
                                    :   line.msg
                                    }
                                </span>
                            ))
                        }
                    </div>
                    <button className="a0-clear-button"
                        onClick={ e => this.clear() }
                    ><span className="a0-clear-text">Clear console</span></button>
                </div>
                { error }
                { reconnecting }
            </div>
        );
    }
    
    clear() {
        this.setState({
            logs: [],
        });
    }
    
    push(event) {
        const logs = this.state.logs.slice();
        
        if (!event.time) event.time = new Date();
        
        logs.push(event);
        
        this.setState({ logs });
    }

    reconnect() {
        const message = this.logStream
            ?   'Reconnecting...'
            :   'Connecting...';
        
        if (this.logStream) {
            this.logStream.destroy();
            this.logStream.removeAllListeners();
        }
        
        this.setState({
            reconnecting: message,
            error: null
        });
                
        this.logStream = this.props.sandbox.createLogStream({ json: true });
        
        this.logStream.on('open', (e) => {
            this.setState({
                error: null,
                reconnecting: false
            });
                        
            this.push({
                msg: 'Connected to ' + this.props.sandbox.container,
                className: '-success',
            });
        });

        this.logStream.on('error', (error) => {
            this.setState({
                error: error,
                reconnecting: false,
            });
            
            if (!this.state.error) {
                this.push({
                    msg: error.message,
                    className: '-danger',
                });
            }
            
            if (this.props.onError) this.props.onError(error);
        });

        this.logStream.on('data', (event) => {
            this.setState({ error: null, reconnecting: false });
            
            if (event.name && event.name.match(/^sandbox-logs|^webtask-/)) {
                if (!event.sandbox) {
                    event.className = '-muted';
                } else {
                    event.className = '';
                }
                
                event.time = new Date(event.time);
                
                this.push(event);
                
                if (this.props.onMessage) this.props.onMessage(event.msg);
            }
            
            if (this.props.onEvent) this.props.onEvent(event);
        });
    }
    
    onClickReconnect() {
        this.reconnect();
    }
}

Logs.title = 'View webtask logs';

Logs.propTypes = {
    sandbox: React.PropTypes.instanceOf(Sandbox).isRequired,
    onMessage: React.PropTypes.func,
    onEvent: React.PropTypes.func,
    onError: React.PropTypes.func,
};
