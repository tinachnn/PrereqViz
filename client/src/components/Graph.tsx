import React from 'react';
import './Graph.css';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';
import 'vis-network/styles/vis-network.css';

interface Class {
    code : string;
    name : string;
    prereqs : string[];
    areas : string[];
    units : number;
}

interface Node {
    id : number;
    label : string;
}

interface Edge {
    id : number;
    from : number;
    to : number;
}

export default function Graph(props : any) {
    const classList : Class[] = props.data;
    const classCodeList : string[] = classList.map((cl : Class) => cl['code']);
    let map = new Map();

    let nodeList : Node[] = [];
    for (let i = 0; i < classCodeList.length; i++) {
        const key = classCodeList[i]
        // SKIP CS396 AND 397 FOR NOW
        if (key === 'CS396' || key === 'CS397') {
            continue;
        }
        const val = i + 1;
        map.set(key, val);
        nodeList.push({ id : val, label : key });
    }

    let nodes = new DataSet(nodeList);

    let edgeList : Edge[] = [];
    let num = 0;
    classList.forEach((cl : Class) => {
        const classCode = cl['code'];
        if (classCode !== 'CS396' && classCode !== 'CS397') {
            const prereqList = cl['prereqs'];
            let prereqCodes : string[] = [];
            prereqList.forEach((str : string) => {
                if (str.includes('/')) {
                    let parts = str.split('/');
                    prereqCodes.push(...parts);
                }
                else {
                    prereqCodes.push(str);
                }
            })
            prereqCodes.forEach((code : string) => {
                edgeList.push({ id : num, from : map.get(classCode), to : map.get(code) });
                num += 1;
            })
        }
    })

    let edges = new DataSet(edgeList);

    let container = document.getElementById('network');
    if (container) {
        let data = { nodes, edges };
        let options = {
            nodes: {
                shape: 'circle'
            },
            interaction: {
                dragView: true,
                zoomView: true
            }
        };
        let network = new Network(container, data, options);
    } else {
        console.log('No container for network.')
    }

    return (
        <div id="network">
        </div>
    )
}