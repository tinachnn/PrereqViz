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

    const nodeList : any[] = [];
    for (let i = 0; i < classList.length; i++) {
        const cl : Class = classList[i];
        const code : string = cl['code'];
        // skip cs396 and cs397
        if (code === 'CS396' || code === 'CS397') {
            continue;
        }
        nodeList.push({ id : i, label : code , data : cl });
    }

    const nodes = new DataSet(nodeList);

    const edgeList : any[] = [];
    let edgeCount : number = 0;
    classList.forEach((cl : Class) => {
        const code : string = cl['code'];
        const prereqList : string[] = cl['prereqs'];
        
        if (code !== 'CS396' && code !== 'CS397') {
            const prereqCodes : string[] = [];

            // parse prereq list
            prereqList.forEach((str : string) => {
                if (str.includes('/')) {
                    const parts : string[] = str.split('/');
                    prereqCodes.push(...parts);
                }
                // ignore consent for now
                else if (str !== 'CONSENT') {
                    prereqCodes.push(str);
                }
            })

            // add edges
            const getNodeId = (code : string) => nodeList.filter(node => node.label === code)[0].id;
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

        const nodeColor = '#EEE4D3';
        const hoverColor = '#A8CCC9';
        const inColor = '#EACBD2';
        const outColor = '#A2D897';

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
                    face: 'Roboto'
                },
                color: {
                    background: nodeColor,
                    border: nodeColor,
                    highlight: hoverColor,
                    hover : hoverColor
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
            if (event.nodes.length > 0) {
                network.selectNodes([]);
                const nodeId : number = event.nodes[0];
                const node : any = nodes.get(nodeId);
                const connectedEdges = network.getConnectedEdges(nodeId);
                if (!('opacity' in node) || node.opacity === 1) {
                    nodes.updateOnly({ id : nodeId, opacity : 0.2 });
                    connectedEdges.forEach((edgeId) => {
                        const edge = edges.get(edgeId);
                        // hide edges
                        edges.updateOnly({ id : edgeId, hidden : true });

                        // set node and edges to default
                        nodes.updateOnly({ id : nodeId , font : { size : 30 }})
                        nodes.updateOnly({ id : edge.to, color : options.nodes.color , font : { size : 30 }});
                        nodes.updateOnly({ id : edge.from, color : options.nodes.color , font : { size : 30 }});
                    })
                } else {
                    // set nodes and edges back to normal
                    nodes.updateOnly({ id : nodeId, opacity : 1 });
                    connectedEdges.forEach((edgeId) => {
                        edges.updateOnly({ id : edgeId, hidden : false })
                    })
                }
            }
        })

        network.on('hoverNode',  (event) => {
            const nodeId : number = event.node;
            const node : any = nodes.get(nodeId);

            // ignore if node is opaque
            if (!('opacity' in node) || node.opacity === 1) {
                nodes.updateOnly({ id : nodeId, font : { size : 40 } })

                // highlight incoming nodes and edges '#EACBD2, outgoing nodes and edges #A2D897
                const connectedEdges = network.getConnectedEdges(nodeId);
                connectedEdges.forEach((edgeId) => {
                    const edge = edges.get(edgeId)
                    if (edge.from === nodeId) {
                        edges.updateOnly({ id : edgeId , color : outColor })
                        nodes.updateOnly({ id : edge.to, color : outColor, font : { size : 40 }})
                    } else {
                        edges.updateOnly({ id : edgeId , color : inColor })
                        nodes.updateOnly({ id : edge.from, color : inColor , font : { size : 40 }})
                    }
                });
            }

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const cl = node.data;
                const matches =  cl.code.match(/([a-zA-Z]+)([0-9-]+)/);
                const dpt = matches[1].replace('CS', 'COMP_SCI');
                const code = matches[2];

                sidebar.innerHTML = `<h3>${dpt + ' ' + code}</h3><h3>${cl.name}</h3><p>${cl.description}</p>`
                if (cl.offered.length > 0) {
                    const fmtTerms = cl.offered.map((term : string) => {
                        const szn = term.substring(0, term.length - 2);
                        const sznCap = szn.charAt(0).toUpperCase() + szn.slice(1);
                        const yr = '20' + term.substring(term.length - 2);
                        return sznCap + ' ' + yr;
                    })
                    sidebar.innerHTML += `<p>Offered : ${fmtTerms.join(', ')}</p>`
                }
                sidebar.style.display = 'block';
            }
        })

        // remove highlights on blur
        network.on('blurNode', (event) => {
            const nodeId = event.node;

            // remove highlights on blur
            const connectedEdges = network.getConnectedEdges(nodeId);
            connectedEdges.forEach((edgeId) => {
                const edge = edges.get(edgeId)
                edges.updateOnly({ id : edgeId , color : options.edges.color})
                nodes.updateOnly({ id : edge.to , color : options.nodes.color , font : { size : 30 }})
                nodes.updateOnly({ id : edge.from , color : options.nodes.color , font : { size : 30 }})
            });

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.display = 'none';
            }
        })

    }

    return (
        <div>
            <div id="network"></div>
            <div id="sidebar"></div>
        </div>
    )
}