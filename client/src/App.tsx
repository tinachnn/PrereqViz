import React, { useState, useEffect} from 'react';
import './App.css';
import Graph from './components/Graph';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/record')
      .then(response => response.json())
      .then(response => {
        console.log(response);
        setData(response);
      })
      .catch(error => console.log(error))
  }, [])
  
  return (
    <div className="App">
        <Graph data={ data }/>
    </div>
  );
}

export default App;
