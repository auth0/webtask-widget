import isEqual from 'lodash.isequal';
import React from 'react';


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
                            <abbr title="Disable this if you need full control over the incoming request stream such as when using webtask-tools and express.">context.body</abbr>.
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