import React from 'react';
import ReactModal from 'react-modal';

export default function ReactModalAdapter({ className, modalClassName, ...props }) {
    return (
        <ReactModal
            className={modalClassName}
            portalClassName={className}
            {...props}
        />
    )
}
