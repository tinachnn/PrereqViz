import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Graph from './components/Graph';
import Progress from './components/Progress';

function App() {
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState<{ id: number, areas: string[]}[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/record')
      .then(response => response.json())
      .then(response => setData(response))
      .catch(error => console.log(error))
  }, [])

  const addToProgress = (id : number, areas : string[]) => {
    setProgress(progress => [...progress, { id , areas }]);
  };

  const removeFromProgress = (id : number) => {
    setProgress(progress => progress.filter(item => item.id !== id));
  };
  
  const graph = useMemo(() => <Graph data={data} addToProgress={addToProgress} removeFromProgress={removeFromProgress} />, [data])

  return (
    <div className="App">
      { graph }
      <Progress progress={ progress }/>
    </div>
  );
}

export default App;
