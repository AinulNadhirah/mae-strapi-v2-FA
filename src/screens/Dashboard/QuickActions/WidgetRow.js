import PropTypes from "prop-types";
import React from "react";

import ManageListItem from "@components/ListItems/ManageDragListItem";

function WidgetRow({
    id,
    index,
    title,
    disabled,
    onMoveUp,
    onMoveDown,
    disabledAdding,
    availableType,
    onRemove,
    onAdd,
    disabledUp,
    disabledDown,
    onLongPress,
    isActive,
    ...props
}) {
    function handleMoveUp() {
        onMoveUp(id, index);
    }

    function handleMoveDown() {
        onMoveDown(id, index);
    }

    function handleAdd() {
        onAdd(id);
    }

    function handleRemove() {
        onRemove(id, index);
    }
    function handleDragAndDrop() {
        !disabled && onLongPress();
    }

    return (
        <ManageListItem
            title={title}
            disabled={disabled}
            availableType={availableType}
            disabledAdding={disabledAdding}
            disabledUp={disabledUp}
            disabledDown={disabledDown}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onAdd={handleAdd}
            onRemove={handleRemove}
            compact
            onLongPress={handleDragAndDrop}
            isActive={isActive}
            {...props}
        />
    );
}

WidgetRow.propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    title: PropTypes.string,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    disabledAdding: PropTypes.bool,
    availableType: PropTypes.bool,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func,
    disabledUp: PropTypes.bool,
    disabledDown: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default WidgetRow;
