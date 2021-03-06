import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Types = {
    SUCCESS: 'success',
    DANGER: 'danger',
    INFO: 'info',
    WARNING: 'warning'
};

const PROPERTY_TYPES = {
    extra: PropTypes.any,
    type: PropTypes.oneOf([Types.SUCCESS, Types.WARNING, Types.DANGER, Types.INFO]),
    testId: PropTypes.any
};
const DEFAULT_PROPS = {};

class Alert extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let style = classNames(this.props.className, 'ros-alert', {
            'ros-alert--success': this.props.type === Types.SUCCESS,
            'ros-alert--danger': this.props.type === Types.DANGER,
            'ros-alert--info': this.props.type === Types.INFO,
            'ros-alert--warning': this.props.type === Types.WARNING
        });

        return (
            <div data-test-id={this.props.testId} className={style}>
                <div className="ros-alert__title">{this.props.title}</div>
                <div className="ros-alert__description">{this.props.description}</div>
                <div className="ros-alert__extra">{this.props.extra}</div>
            </div>
        );
    }
}

Alert.propTypes = PROPERTY_TYPES;
Alert.defaultProps = DEFAULT_PROPS;
Alert.Type = Types;

export default Alert;
