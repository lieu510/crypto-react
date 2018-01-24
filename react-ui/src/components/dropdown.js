import React from 'react';

const Dropdown = (props) => {
    const options = props.list.map(item => {
        return <option key={item} value={item}>{item}</option>
    })
    return (
        <select value={props.value} onChange={props.handleChange}>
            {options}
        </select>
    )
}

export default Dropdown;