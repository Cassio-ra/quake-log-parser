const express= require('express');
const app = express();
const port = 4000;

const parseLogFile = require('./services/parser');

app.get('/parser', (req, res) => {
    parseLogFile('./src/qgames.log', (err, data) => {
        if (err) {
            res.status(500).send('Ocorreu um erro: ' + err);
            return;
        }
        console.log(data);
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}!`)
    console.log(`Server's running on port: ${port}!`)
});