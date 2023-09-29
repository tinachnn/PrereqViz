import React from 'react';
import './Progress.css'
import ProgressBar from './ProgressBar';

export default function({ progress } : any) {
    console.log(progress);
    return (
        <div className="progress">
            <ProgressBar current={ 0 } total={6} cat='Required'/>
            <ProgressBar current={ 0 } total={5} cat='Breadth'/>
            <ProgressBar current={ 0 } total={2} cat='Project'/>
            <ProgressBar current={ 0 } total={6} cat='Technical'/>
        </div>
    )
}