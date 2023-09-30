import React from 'react';
import './Progress.css'
import ProgressBar from './ProgressBar';

export default function Progress(props : any) {
    const { progress } = props;
    const counts : any = {
        core : 0, 
        project : 0,
        technical : 0,
        related : 0,
        breadth : {}
    };

    const breadths = ['software', 'theory', 'ai', 'interfaces', 'systems'];
    breadths.forEach((area : string) => counts.breadth[area] = 0);

    // increment counts for each area
    progress.forEach((item : { id : number , area : string }) => breadths.includes(item.area) ? counts.breadth[item.area] += 1 : counts[item.area] += 1);

    return (
        <div className="progress">
            <ProgressBar current={ counts.core } total={6} cat='Required'/>
            <ProgressBar current={ Object.values(counts.breadth).reduce((a : any, b : any) => a + b, 0) } total={5} counts={ counts.breadth } cat='Breadth'/>
            <ProgressBar current={ counts.project } total={2} cat='Project'/>
            <ProgressBar current={ counts.technical } total={6} cat='Technical'/>
            <ProgressBar current={ counts.related } total={5} cat='Related'/>
        </div>
    )
}