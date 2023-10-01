import React from 'react';
import './ProgressBar.css'

export default function ProgressBar(props : any) {
    const { total , cat } = props;
    const current = Math.min(props.current, total);
    const progress = current / total * 100;

    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
                <div className="text-container">
                    <span className="text" >{ current }/{ total } {cat}</span>
                </div>
            </div>
        </div>
    )
}