import React from 'react';
import './Graph.css';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';
import 'vis-network/styles/vis-network.css';

export default function Graph(props : any) {
    const { classList } = props;

    // add classes as nodes
    const nodeList : any[] = [];
    for (let i = 0; i < classList.length; i++) {
        nodeList.push({ id : i, label :  classList[i]['code'] , data : classList[i] });
    }

    const nodes = new DataSet(nodeList);

    // add edges between classes and their prereqs
    const edgeList : any[] = [];
    let edgeCount : number = 0;
    classList.forEach((cl : any) => {
        const { code , name , prereqs} = cl;
        
        // split OR prereqs (ex. CS110/CS111) to get class codes
        const nestedPrereqs = prereqs.map((str : string) => str.includes('/') ? str.split('/') : str);
        const prereqCodes : string[] = [].concat(...nestedPrereqs);

        const getIdByCode = (code : string) => nodeList.filter(node => node.label === code)[0].id;
        const getIdByName = (name : string) => nodeList.filter(node => node.data.name === name)[0].id;

        // loop through each prereq to add edges
        prereqCodes.forEach((prereqCode : string) => {
            const prereqId = getIdByCode(prereqCode);
            // search for CS396 nodes by name instead of class code
            const nodeId = (code === 'CS396' || code === 'CS397') ? getIdByName(name) : getIdByCode(code);
            edgeList.push({ id : edgeCount, from : prereqId, to : nodeId });
            edgeCount += 1;
        })
    })

    const edges = new DataSet(edgeList);

    const container = document.getElementById('network');
    if (container) {
        const data = { nodes, edges };
        const colors = {
            default : '#848484',
            node : '#EEE4D3',
            hover : '#A8CCC9',
            in : '#EACBD2',
            out : '#A2D897'
        };

        // set network options
        const options = {
            physics: {
                barnesHut: { centralGravity: 0.5 },
                enabled: true,
                stabilization: true
            },
            nodes: {
                borderWidth : 0,
                color: {
                    background: colors.node,
                    border: colors.node,
                    highlight: colors.hover,
                    hover : colors.hover
                },
                font: {
                    size: 30,
                    face: 'Roboto'
                },
                shape: 'circle',
                size: 100
            },
            edges: {
                arrows: 'to',
                color: { color: colors.default },
                length: 500
            },
            interaction: { hover: true }
        };

        const network = new Network(container, data, options); // initalize network

        // hide loading animation when network finishes
        network.once('stabilizationIterationsDone', () => {
            const wrapper = document.getElementById('wrapper');
            if (wrapper) {
                wrapper.style.display = 'none';
            }
        });

        // handle connected prereqs (ex. CS110 OR CS111)
        const handleConnectedPrereqs = (nodeId : number, edgeId : number, hide : boolean) => {
            const node = nodes.get(nodeId);
            const edge = edges.get(edgeId);
            if (edge.from === nodeId) {
                // get node that clickedNode is a prereq for
                const dstNodeId : number = edge.to;
                const dstNode : any = nodes.get(dstNodeId);

                const dstPrereqs = dstNode.data.prereqs;
                dstPrereqs.forEach((str : string) => {
                    // i.e. dstNode has prereq of 'clickedNode / otherNode'
                    if (str.includes('/') && str.includes(node.label)) {
                        const parts : string[] = str.split('/');
                        // find the edge between otherNode(s) and dstNode
                        const dstEdges = network.getConnectedEdges(dstNodeId);
                        const otherEdgeIds = dstEdges.filter((edgeId) => {
                            const fromNode : any = nodes.get(edges.get(edgeId).from);
                            return parts.includes(fromNode.label);
                        })
                        // hide edge from otherNode(s) to destination
                        otherEdgeIds.forEach(id => edges.updateOnly({ id : id, hidden : hide }));
                    }
                })
            }
        }
        
        network.on('click', (event) => {
            // check if clicked on node
            if (event.nodes.length > 0) {
                network.selectNodes([]);
                const nodeId : number = event.nodes[0];
                const node : any = nodes.get(nodeId);
                const connectedEdges = network.getConnectedEdges(nodeId).map(id => Number(id));
                const isOpaque = (node : any) => !('opacity' in node) || node.opacity === 1;

                // update nodes and edges depending on whether node is being selected or de-selected
                const update = (select : boolean) => {
                    const newOpacity : number = select ? 0.2 : 1;
                    nodes.updateOnly({ id : nodeId, opacity : newOpacity });
                    select ? props.addToProgress(nodeId, node.data.areas) : props.removeFromProgress(nodeId);

                    connectedEdges.forEach((edgeId) => {
                        const edge = edges.get(edgeId);
                        const fromNode : any = nodes.get(edge.from);
                        const toNode : any = nodes.get(edge.to);
                        const changeEdge : boolean = select ? true 
                            : isOpaque(fromNode) && isOpaque(toNode);
                        if (changeEdge) {
                            edges.updateOnly({ id : edgeId, hidden : select });
                        }
                        handleConnectedPrereqs(nodeId, edgeId, select);

                        const newSize : number = select ? 30 : 40;
                        const toColor = select ? options.nodes.color : colors.out;
                        const fromColor = select ? options.nodes.color : colors.in;

                        nodes.updateOnly({ id : nodeId , font : { size : newSize }});
                        nodes.updateOnly({ id : edge.to, color : toColor , font : { size : newSize }});
                        nodes.updateOnly({ id : edge.from, color : fromColor , font : { size : newSize }});
                    })
                }

                update(isOpaque(node));
            }
        })

        network.on('hoverNode',  (event) => {
            const nodeId : number = event.node;
            const node : any = nodes.get(nodeId);

            // ignore if node is selected
            if (!('opacity' in node) || node.opacity === 1) {
                nodes.updateOnly({ id : nodeId, font : { size : 40 } }); // increase size of node

                const connectedEdges = network.getConnectedEdges(nodeId);
                connectedEdges.forEach((edgeId) => {
                    const edge = edges.get(edgeId);
                    if (!edge.hidden) {
                        // highlight incoming nodes/edges one color and outoging nodes/edges another
                        if (edge.from === nodeId) {
                            edges.updateOnly({ id : edgeId , color : colors.out });
                            nodes.updateOnly({ id : edge.to, color : colors.out, font : { size : 40 }});
                        } else {
                            edges.updateOnly({ id : edgeId , color : colors.in });
                            nodes.updateOnly({ id : edge.from, color : colors.in , font : { size : 40 }});
                        }
                    }
                });
            }

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const cl = node.data;
                const matches =  cl.code.match(/([a-zA-Z]+)([0-9-]+)/); // separate code into dpt and code

                const names : any = {
                    CS : 'COMP_SCI',
                };
                const dpt = matches[1].replace(/CS/gi, (match : string) => names[match]);
                const code = matches[2];

                sidebar.innerHTML = `<h3>${dpt + ' ' + code}</h3><h3>${cl.name}</h3><p>${cl.description}</p>`;
                sidebar.style.display = 'block'; // show sidebar

                // add which terms offered in 2023-2024 school year
                if (cl.offered.length > 0) {
                    const fmtTerms = cl.offered.map((term : string) => {
                        const szn = term.substring(0, term.length - 2);
                        const sznCap = szn.charAt(0).toUpperCase() + szn.slice(1);
                        const yr = '20' + term.substring(term.length - 2);
                        return sznCap + ' ' + yr;
                    })
                    sidebar.innerHTML += `<p>Offered : ${fmtTerms.join(', ')}</p>`;
                }
                
                // add instructor consent notice
                if ('consent' in cl && cl.consent) {
                    sidebar.innerHTML += `<p>Instructor consent required</p>`;
                }
            }
        })

        network.on('blurNode', (event) => {
            const nodeId = event.node;
            nodes.updateOnly({ id : nodeId , color : options.nodes.color , font : { size : 30 }}); // reset node size

            const connectedEdges = network.getConnectedEdges(nodeId);
            connectedEdges.forEach((edgeId) => {
                const edge = edges.get(edgeId);
                // reset edge and connected nodes styling to default
                edges.updateOnly({ id : edgeId , color : options.edges.color});
                nodes.updateOnly({ id : edge.to , color : options.nodes.color , font : { size : 30 }});
                nodes.updateOnly({ id : edge.from , color : options.nodes.color , font : { size : 30 }});
            });

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.display = 'none'; // hide sidebar
            }
        })

    }

    return (
        <div>
            <div id="network"></div>       
            <div id="wrapper">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="shadow"></div>
                <div className="shadow"></div>
                <div className="shadow"></div>
                <span>Loading</span>
            </div>
            <div id="sidebar"></div>
        </div>
    )
}