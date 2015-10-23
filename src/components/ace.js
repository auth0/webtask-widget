import Ace from 'brace';
import React from 'react';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/textmate';

const Editor = Ace.acequire('./editor').Editor;
const EditSession = Ace.acequire('./edit_session').EditSession;
const VirtualRenderer = Ace.acequire('./virtual_renderer').VirtualRenderer;
const UndoManager = Ace.acequire('./undomanager').UndoManager;


export default class AceEditorComponent extends React.Component {
    constructor(props) {
        super(props);
        
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    
    componentDidMount() {
        const node = this.refs[this.props.name].getDOMNode();
        
        this.renderer = new VirtualRenderer(node, `ace/theme/${this.props.theme}`);
        this.undoManager = new UndoManager();
        this.editSession = new EditSession(this.props.value, `ace/mode/${this.props.mode}`);
        this.editSession.setUndoManager(this.undoManager);
        this.editor = new Editor(this.renderer);
        this.editor.setSession(this.editSession);
        
        this.componentWillReceiveProps(this.props);

        this.editor.on('focus', this.onFocus);
        this.editor.on('blur', this.onBlur);
        this.editor.on('copy', this.onCopy);
        this.editor.on('paste', this.onPaste);
        this.editor.on('change', this.onChange);

        if (this.props.onLoad) {
            this.props.onLoad(this.editor);
        }
    }

    componentWillUnmount() {
        this.editor.removeListener('focus', this.onFocus);
        this.editor.removeListener('blur', this.onBlur);
        this.editor.removeListener('copy', this.onCopy);
        this.editor.removeListener('paste', this.onPaste);
        this.editor.removeListener('change', this.onChange);
        
        this.editor = null;
    }

    componentWillReceiveProps(nextProps) {
        this.renderer.setTheme(`ace/theme/${nextProps.theme}`);
        this.renderer.setShowGutter(nextProps.showGutter);
        
        if (this.editSession.getValue() !== nextProps.value) {
            this.silent = true;
            this.editSession.setValue(nextProps.value);
            this.silent = false;
        }
        
        this.editSession.setMode(`ace/mode/${nextProps.mode}`);
        
        this.editor.setFontSize(nextProps.fontSize);
        this.editor.setOption('maxLines', nextProps.maxLines);
        this.editor.setOption('minLines', nextProps.minLines);
        this.editor.setOption('readOnly', nextProps.readOnly);
        this.editor.setOption('highlightActiveLine', nextProps.highlightActiveLine);
        this.editor.setOption('tabSize', nextProps.tabSize);
        this.editor.setShowPrintMargin(nextProps.setShowPrintMargin);
    }
    
    shouldComponentUpdate(nextProps, nextStyle) {
        return nextProps.width !== this.props.width
            || nextProps.height !== this.props.height
            || nextProps.className !== this.props.className;
    }

    render() {
        const divStyle = {
            width: this.props.width,
            height: this.props.height
        };
        const className = this.props.className;
        return (
            <div ref={this.props.name}
                className={className}
                style={divStyle}>
            </div>
        );
    }

    onChange() {
        const value = this.editor.getValue();
        if (this.props.onChange && !this.silent) {
            this.props.onChange(value);
        }
    }
    
    onFocus() {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }
    
    onBlur() {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }
    
    onCopy(text) {
        if (this.props.onCopy) {
            this.props.onCopy(text);
        }
    }
    
    onPaste(text) {
        if (this.props.onPaste) {
            this.props.onPaste(text);
        }
    }
}

AceEditorComponent.propTypes = {
    mode: React.PropTypes.string,
    theme: React.PropTypes.string,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
    height: React.PropTypes.string,
    width: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    showGutter: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    value: React.PropTypes.string,
    onLoad: React.PropTypes.func,
    onBeforeLoad: React.PropTypes.func,
    maxLines: React.PropTypes.number,
    minLines: React.PropTypes.number,
    readOnly: React.PropTypes.bool,
    highlightActiveLine: React.PropTypes.bool,
    tabSize: React.PropTypes.number,
    showPrintMargin: React.PropTypes.bool,
    cursorStart: React.PropTypes.number,
    editorProps: React.PropTypes.object
};

AceEditorComponent.defaultProps = {
    name: 'brace-editor',
    mode: 'text',
    theme: 'textmate',
    height: '500px',
    width: '500px',
    value: '',
    fontSize: 12,
    showGutter: true,
    onChange: null,
    onPaste: null,
    onLoad: null,
    maxLines: null,
    readOnly: false,
    highlightActiveLine: true,
    showPrintMargin: true,
    tabSize: 4,
    cursorStart: 1,
    editorProps: {}
};