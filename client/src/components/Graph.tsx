import React, { useState } from 'react';
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
                    background: '#EEE4D3',
                    border: '#EEE4D3',
                    highlight: '#A8CCC9',
                    hover : '#A8CCC9'
                },
                opacity: 1
            },
            edges: {
                arrows: 'to',
                color: {
                    color: '#848484'
                },
                length: 500
            },
            interaction: {
                hover: true
            }
        };
        const network = new Network(container, data, options);
        
        // toggle opaquenes on click
        network.on('click', (event) => {
            console.log(event);
            network.selectNodes([]);
            if (event.nodes.length > 0) {
                const nodeId : number = event.nodes[0];
                const node : any = nodes.get(nodeId);
                const connectedEdges = network.getConnectedEdges(nodeId);
                console.log(connectedEdges)
                if (!('opacity' in node) || node.opacity === 1) {
                    connectedEdges.forEach((edgeId) => {
                        const edge = edges.get(edgeId);
                        edges.updateOnly({ id : edgeId, hidden : true });
                        nodes.updateOnly({ id : nodeId , font : { size : 30 }})
                        nodes.updateOnly({ id : edge.to, color : options.nodes.color , font : { size : 30 }});
                        nodes.updateOnly({ id : edge.from, color : options.nodes.color , font : { size : 30 }});
                    })
                    nodes.updateOnly({ id : nodeId, opacity : 0.2 });
                } else {
                    connectedEdges.forEach((edgeId) => {
                        edges.updateOnly({ id : edgeId, hidden : false })
                    })
                    nodes.updateOnly({ id : nodeId, opacity : 1 });
                }
            }
        })

        // highlight incoming nodes and edges '#EACBD2, outgoing nodes and edges #A2D897
        network.on('hoverNode',  (event) => {
            const nodeId : number = event.node;
            const node : any = nodes.get(nodeId);

            if (!('opacity' in node) || node.opacity === 1) {
                nodes.updateOnly({ id : nodeId, font : { size : 40 } })

                const connectedEdges = network.getConnectedEdges(nodeId);
                connectedEdges.forEach((edgeId) => {
                    const edge = edges.get(edgeId)
                    if (edge.from === nodeId) {
                        edges.updateOnly({ id : edgeId , color : '#A2D897'})
                        nodes.updateOnly({ id : edge.to, color : '#A2D897', font : { size : 40 }})
                    } else {
                        edges.updateOnly({ id : edgeId , color : '#EACBD2'})
                        nodes.updateOnly({ id : edge.from, color : '#EACBD2', font : { size : 40 }})
                    }
                });
            }
        })

        // remove highlights on blur
        network.on('blurNode', (event) => {
            const nodeId = event.node;
            // const node = nodes.get(nodeId);
            const connectedEdges = network.getConnectedEdges(nodeId);

            connectedEdges.forEach((edgeId) => {
                const edge = edges.get(edgeId)
                edges.updateOnly({ id : edgeId , color : options.edges.color})
                nodes.updateOnly({ id : edge.to, color : options.nodes.color , font : { size : 30 }})
                nodes.updateOnly({ id : edge.from, color : options.nodes.color , font : { size : 30 }})
            });
        })

    } else {
        console.log('No container for network.')
    }

    return (
        <div id="network"></div>
    )
}