import React from 'react';

export default class PaneSelector extends React.Component {
    
    render() {
        const className = ['a0-pane-selector'];
        
        if (this.props.size === 'small') className.push('-small');
        
        return (
            <div className={ className.join(' ') }>
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
                                title={ pane.name }
                            ><span className="a0-selector-text">{ pane.name }</span></button>
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
    currentPane: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    panes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    size: React.PropTypes.oneOf(['small', 'large']),
};

PaneSelector.defaultProps = {
    size: 'large',
};