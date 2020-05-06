import React from 'react';
import ReactModal from 'react-modal';

// adapter HOC for styling ReactModal with styled-components
export default function ReactModalAdapter({ className, modalClassName, ...props }) {

    return (
        <ReactModal
            className={modalClassName}
            portalClassName={className}
            {...props}
        />
    )
}
