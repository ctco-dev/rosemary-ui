import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import Popup from '../Popup';
import { isDefined, findIdentifiables, compare } from '../util/utils';
import MultiSelectPopup from './MultiSelectPopup';

import { withIdAndTypeContext } from '../util/hoc/WithIdAndTypeHOC';
import CheckBoxList from '../Select/CheckBoxList';

const PROPERTY_TYPES = {
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            displayString: PropTypes.string.isRequired
        })
    ),
    className: PropTypes.string,
    onChange: PropTypes.func,
    getText: PropTypes.func,
    CheckBoxList: PropTypes.node
};
const DEFAULT_PROPS = {
    placeholder: 'Select...',
    searchPlaceholder: 'Search ...',
    getText: selectedOptions => `${selectedOptions.length} item(s) selected`,
    disabled: false,
    CheckBoxList: CheckBoxList
};

class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.sort(findIdentifiables(this.props.options, props.value)),
            popupOpen: false,
            tooltipOpen: false
        };
    }

    componentWillReceiveProps(nextProps) {
        let isValueChanged = nextProps.value !== this.props.value;
        if (isValueChanged) {
            this.setState({ selected: this.sort(findIdentifiables(nextProps.options, nextProps.value)) });
        }
    }

    select(selected) {
        if (!this.isControlled()) {
            this.setState({
                selected: this.sort(selected)
            });
        }

        if (this.props.onChange) {
            this.props.onChange(
                selected.map(option => {
                    return option.id;
                }),
                selected
            );
        }
    }

    sort(selected) {
        return selected.sort((left, right) => compare(left.displayString, right.displayString));
    }

    handlePopupStateChange(open) {
        if (this.props.disabled) {
            return;
        }

        let newState = {
            popupOpen: open,
            tooltipOpen: false
        };

        this.setState(newState);
        if (open) {
            this.handlePopupOpening();
        }
    }

    handleTooltipStateChange(open) {
        if (!this.state.popupOpen && this.state.selected.length > 0) {
            this.setState({ tooltipOpen: open });
        }
    }

    isControlled() {
        return isDefined(this.props.value);
    }

    handlePopupOpening() {
        let popupContent = ReactDOM.findDOMNode(this.refs.popup.getContent());
        let input = ReactDOM.findDOMNode(this.refs.input);
        popupContent.style.width = `${input.offsetWidth}px`;
    }

    getText() {
        if (this.state.selected.length === 0) {
            return this.props.placeholder;
        } else {
            return this.props.getText(this.state.selected);
        }
    }

    render() {
        let className = classNames(this.props.className, 'select', {
            placeholder: this.state.selected.length === 0,
            disabled: this.props.disabled
        });

        return (
            <Popup
                ref="popup"
                attachment="bottom left"
                on="click"
                popupClassName="select__popover"
                animationBaseName="select__popover--animation-slide-y"
                open={this.state.popupOpen}
                onPopupStateChange={open => this.handlePopupStateChange(open)}
            >
                <Popup
                    attachment="bottom left"
                    on="hover"
                    popupClassName="tooltip"
                    open={this.state.tooltipOpen}
                    onPopupStateChange={open => this.handleTooltipStateChange(open)}
                >
                    <div id={this.props.id} ref="input" tabIndex="0" className={className}>
                        <div>{this.getText()}</div>
                        <i className="im icon-arrow-down" />
                    </div>
                    <div>
                        {this.state.selected.map(option => {
                            return <div key={`tooltip-${option.id}`}>{option.displayString}</div>;
                        })}
                    </div>
                </Popup>

                <MultiSelectPopup
                    placeholder={this.props.searchPlaceholder}
                    options={this.props.options}
                    value={this.state.selected.map(selected => {
                        return selected.id;
                    })}
                    onChange={(selectedIds, selected) => this.select(selected)}
                    compare={compare}
                    CheckBoxList={this.props.CheckBoxList}
                />
            </Popup>
        );
    }
}

MultiSelect.propTypes = PROPERTY_TYPES;
MultiSelect.defaultProps = DEFAULT_PROPS;

export default withIdAndTypeContext(MultiSelect);
