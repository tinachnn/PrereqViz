import React from 'react';
import './ProgressBar.css'

export default function(props : any) {
    return (
        <div className="progress-container">
            <div className="progress-bar"><span>{ props.current }/{ props.total } {props.cat}</span></div>
        </div>
    )
}