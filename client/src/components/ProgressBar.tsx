import React from 'react';
import './ProgressBar.css'

export default function ProgressBar(props : any) {
    const { current, total , cat } = props;

    // multiple classes in same area will increment count but not progress bar t.f. breadth bar progress may not match numbers
    const progress = cat === 'Breadth' 
        ? Object.values(props.counts).map((value : any) => value >= 1 ? 20 : 0).reduce((a : number, b : number) => a + b, 0) 
        : Math.min(current / total * 100, 100);

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