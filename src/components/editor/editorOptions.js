import isEqual from 'lodash.isequal';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


import 'styles/editorOptions.less';


export default class A0AdvancedEditorOptions extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            mergeBody: props.mergeBody,
            parseBody: props.parseBody,
        };
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.onChange && !isEqual(this.state, prevState))
            this.props.onChange({
                mergeBody: this.state.mergeBody,
                parseBody: this.state.parseBody,
            });
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const setState = this.setState.bind(this);
        const getName = () => this.refs.name.getValue();
        const getSecrets = () => this.refs.secrets.getValue();

        const parseBodyHelp = <Tooltip>
            This will attempt to parse the body of incoming requests and expose
            the parsed body at&nbsp;<code>context.body</code>. Do not enable this if
            you are using any server frameworks with&nbsp;
            <a href="https://github.com/auth0/webtask-tools" target="_blank">webtask-tools</a>.
        </Tooltip>;

        const mergeBodyHelp = <Tooltip>
            This will merge any parameters from the parsed body into
            &nbsp;<code>context.data</code>.
        </Tooltip>;
        
        const loading = props.loading;

        return (
            <div className="a0-editor-options">
                <div className="form-group">
                    <div className="checkbox">
                            <label>
                                <input
                                    ref="parseBody"
                                    type="checkbox"
                                    onChange={ (e) => setState({ parseBody: e.target.checked }) }
                                    disabled={ loading }
                                    checked={ state.parseBody }
                                />
                                Automatically parse the request body into 
                                &nbsp;
                                <OverlayTrigger placement="top" overlay={ parseBodyHelp }>
                                    <code>context.body</code>
                                </OverlayTrigger>
                            </label>
                    </div>
                    <div className="checkbox">
                            <label>
                                <input
                                    ref="mergeBody"
                                    type="checkbox"
                                    onChange={ (e) => setState({ mergeBody: e.target.checked }) }
                                    disabled={ loading }
                                    checked={ state.mergeBody }
                                />
                                Merge the parsed body into
                                &nbsp;
                                <OverlayTrigger placement="top" overlay={ mergeBodyHelp} >
                                    <code>context.data</code>
                                </OverlayTrigger>
                            </label>
                    </div>
                </div>
            </div>
        );
    }
    
    getValue() {
        return {
            name: this.state.name,
            mergeBody: this.state.mergeBody,
            parseBody: this.state.parseBody,
            secrets: this.state.secrets,
        };
    }
}

A0AdvancedEditorOptions.propTypes = {
    mergeBody: React.PropTypes.bool.isRequired,
    parseBody: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired,
};