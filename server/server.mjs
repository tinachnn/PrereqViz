import express from 'express';
import cors from 'cors';
import './loadEnvironment.mjs';
import records from './routes/record.mjs';

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors({ origin : '* '}));
app.use(express.json());

app.use('/record', records);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});