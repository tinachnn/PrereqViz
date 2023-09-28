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

export default function Graph(props : any) {
    const classList : Class[] = props.data;
    const classCodeList : string[] = classList.map((cl : Class) => cl['code']);
    let map = new Map();

    let nodeList : any[] = [];
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

    let edgeList : any[] = [];
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
                edgeList.push({ id : num, from : map.get(code), to : map.get(classCode) });
                num += 1;
            })
        }
    })

    let edges = new DataSet(edgeList);

    let container = document.getElementById('network');
    if (container) {
        let data = { nodes, edges };
        let options = {
            physics: {
                enabled: true,
                barnesHut: {
                    centralGravity: 0.5
                },
                stabilization: true
            },
            nodes: {
                borderWidth : 0,
                shape: 'circle',
                size: 100,
                font: {
                    size: 30,
                },
                color: {
                    background: '#F3EFE0',
                    border: '#F3EFE0',
                    highlight: '#A8CCC9',
                    hover : '#A8CCC9'
                }
            },
            edges: {
                arrows: 'to',
                color: {
                    color: '#848484'
                },
                length: 500
            },
            interaction: {
                dragView: true,
                zoomView: true,
                hover: true,
            }
        };
        const network = new Network(container, data, options);

        // network.on('click', (event) => {
        //     console.log(event);
        //     if (event.nodes.length > 0) {
        //         const nodeId = event.node;
        //         if (nodes.get(nodeId)) {
        //             nodes.updateOnly({ id : nodeId, color : { opacity : 0.2 } })
        //         }
        //     } else {
        //         console.log('no nodes')
        //     }
        // })

        network.on('hoverNode',  (event) => {
            const nodeId = event.node;

            nodes.updateOnly({ id : nodeId, font : { size : 40 } })

            const connectedEdges = network.getConnectedEdges(nodeId);

            connectedEdges.forEach((edgeId) => {
                const edge = edges.get(edgeId)
                if (edge.from == nodeId) {
                    edges.updateOnly({ id : edgeId , color : '#A2D897'})
                    nodes.updateOnly({ id : edge.to, color : '#A2D897', font : { size : 40 }})
                } else {
                    edges.updateOnly({ id : edgeId , color : '#EACBD2'})
                    nodes.updateOnly({ id : edge.from, color : '#EACBD2', font : { size : 40 }})
                }
            });
        })

        network.on('blurNode', (event) => {
            const nodeId = event.node;
            nodes.updateOnly({ id : nodeId ,font : { size : 30 } })

            const connectedEdges = network.getConnectedEdges(nodeId);

            connectedEdges.forEach((edgeId) => {
                const edge = edges.get(edgeId)
                network.selectEdges([edgeId]);
                edges.updateOnly({ id : edgeId , color : options.edges.color})
                nodes.updateOnly({ id : edge.to, color : options.nodes.color , font : { size : 30 }})
                nodes.updateOnly({ id : edge.from, color : options.nodes.color , font : { size : 30 }})
            });
        })

    } else {
        console.log('No container for network.')
    }

    return (
        <div id="network">
        </div>
    )
}