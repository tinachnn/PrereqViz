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

    const nodeList : any[] = [];
    for (let i = 0; i < classList.length; i++) {
        const cl = classList[i];
        const code = cl['code'];
        const title = cl['name'];
        // skip cs396 and cs397
        if (code === 'CS396' || code === 'CS397') {
            continue;
        }
        nodeList.push({ id : i, label : code , title : title });
    }

    const nodes = new DataSet(nodeList);

    const edgeList : any[] = [];
    let edgeCount = 0;
    classList.forEach((cl : Class) => {
        const code = cl['code'];
        const prereqList = cl['prereqs'];
        
        if (code !== 'CS396' && code !== 'CS397') {
            const prereqCodes : string[] = [];

            // parse prereq list
            prereqList.forEach((str : string) => {
                if (str.includes('/')) {
                    const parts = str.split('/');
                    prereqCodes.push(...parts);
                }
                // ignore consent for now
                else if (str !== 'CONSENT') {
                    prereqCodes.push(str);
                }
            })

            // add edges
            const getNodeId = (code : string) => {
                return nodeList.filter(node => node.label === code)[0].id
            }
            prereqCodes.forEach((prereqCode : string) => {
                edgeList.push({ id : edgeCount, from : getNodeId(prereqCode), to : getNodeId(code) });
                edgeCount += 1;
            })
        }
    })

    const edges = new DataSet(edgeList);

    const container = document.getElementById('network');
    if (container) {
        const data = { nodes, edges };
        const options = {
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