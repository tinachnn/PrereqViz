import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Graph from './components/Graph';
import Progress from './components/Progress';
import AreasDialog from './components/AreasDialog';

function App() {
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState<{ id: number, area: string}[]>([]);

  const [current, setCurrent] = useState<{ id: number, areas: string[]}>();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>();
  
  useEffect(() => {
    fetch('http://localhost:5001/record')
      .then(response => response.json())
      .then(response => setData(response))
      .catch(error => console.log(error));
  }, [])

  useEffect(() => {
    if (selectedValue && current) {
      setProgress(progress => [...progress, { id : current.id , area : selectedValue }])
    }
  }, [selectedValue, current])

  const addToProgress = (id : number, areas : string[]) => {
    if (areas.length === 1) {
      const area : string = areas[0];
      setProgress(progress => [...progress, { id , area }]);
    } else if (areas.length > 1) {
      setCurrent({ id , areas })
      setOpen(true)
      setSelectedValue('');
    }
  };

  const removeFromProgress = (id : number) => {
    setProgress(progress => progress.filter(item => item.id !== id));
  };

  const handleClose = (value: string) => {
      setOpen(false);
      setSelectedValue(value);
  };
  
  const graph = useMemo(() => <Graph classList={ data } addToProgress={ addToProgress } removeFromProgress={ removeFromProgress }/>, [data])

  return (
    <div className="App">
      { graph }
      <Progress progress={ progress }/>
      { current && <AreasDialog current={ current } selectedValue={ current.areas[0] } open={ open } onClose={ handleClose }/>}
    </div>
  );
}

export default App;
