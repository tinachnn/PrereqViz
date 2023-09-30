import React from 'react';
import './ProgressBar.css'

export default function(props : any) {
    const current : number = props.current;
    const total : number = props.total;
    const progress = current / total * 100;
    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
                <div className="text-container">
                    <span className="text" >{ current }/{ total } {props.cat}</span>
                </div>
            </div>
        </div>
    )
}