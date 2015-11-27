import React from 'react';

export default class PaneSelector extends React.Component {
    render() {
        return (
            <div className="a0-pane-selector">
                {
                    this.props.panes.map((pane) => {
                        const classNames = ['a0-icon-button', '-icon', pane.iconClass];
                        
                        if (pane === this.props.currentPane) {
                            classNames.push('-arrow-below');
                        }
                    
                        return (
                            <button
                                className={ classNames.join(' ') }
                                key={ pane.name }
                                onClick={ () => this.onSelectPane(pane) }
                            >{ pane.name }</button>
                        );
                    })
                }
            </div>
        );
    }
    
    onSelectPane(pane) {
        this.props.onChange(pane);
    }
}

PaneSelector.propTypes = {
    currentPane: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    panes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};