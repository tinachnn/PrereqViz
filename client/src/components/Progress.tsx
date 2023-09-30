import React from 'react';
import './Progress.css'
import ProgressBar from './ProgressBar';

export default function Progress(props : any) {
    const { progress } = props;
    console.log('AREAS')
    console.log(progress.areas)
    const counts : any = {
        'core' : {
            'current' : 0,
            'total' : 6
        },
        'project' : {
            'current' : 0,
            'total' : 2
        },
        'technical' : {
            'current' : 0,
            'total' : 6
        },
        'related' : {
            'current' : 0,
            'total' : 5
        }
    }
    const breadth = ['software', 'theory', 'ai', 'interfaces', 'systems'];
    breadth.forEach((area : string) => counts[area] = { 'current' : 0 , 'total' : 1 })

    const areasList = progress.map((item : any) => item.areas)

    // round 1 
    // const assignItem = (areas : string[]) => {
    //     // only one choice (core, related, technical)
    //     counts[areas[0]].current += 1;
    // }
    console.log(areasList)
    areasList.forEach((areas : string[]) => counts[areas[0]].current += 1)

    return (
        <div className="progress">
            <ProgressBar current={ counts.core.current } total={ counts.core.total } cat='Required'/>
            <ProgressBar current={ counts.software.current + counts.theory.current + counts.ai.current + counts.interfaces.current + counts.systems.current } total={ counts.software.total + counts.theory.total + counts.ai.total + counts.interfaces.total + counts.systems.total } cat='Breadth'/>
            <ProgressBar current={ counts.project.current } total={ counts.project.total } cat='Project'/>
            <ProgressBar current={ counts.technical.current } total={ counts.technical.total } cat='Technical'/>
            <ProgressBar current={ counts.related.current } total={ counts.related.total } cat='Related'/>
        </div>
    )
}