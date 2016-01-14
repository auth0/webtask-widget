import React from 'react';
import Sandbox from 'sandboxjs';

import Inspector from 'react-object-inspector';

import 'styles/logs.less';

export default class Logs extends React.Component {
    constructor(props) {
        super(props);

        this.logStream = null;
        this.state = {
            logs: Array.isArray(props.logs) ? props.logs.slice() : [],
        };
    }

    componentDidMount() {
        this.logStream = this.props.sandbox.createLogStream();
        
        this.logStream.on('open', (e) => {
            this.push({
                msg: 'Connected to ' + this.props.sandbox.container,
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
            if (event.name && event.name.match(/^sandbox-logs|webtask-/)) {
                if (event.msg.match(/^webtask container (assigned|recycled)$/)) {
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
        return (
            <div className="a0-logs-widget">
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
                ></button>
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

Logs.title = 'View webtask logs';

Logs.propTypes = {
    sandbox: React.PropTypes.instanceOf(Sandbox).isRequired,
    onMessage: React.PropTypes.func,
    onEvent: React.PropTypes.func,
    onError: React.PropTypes.func,
};
