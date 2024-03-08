const fs = require('fs');

function parseLogFile(filePath, callback) {
    //Coleta as informações do arquivo passado pelo filePath
    //Collects information from the file passed through the filepath
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }

        //Trata o arquivo para manipulação das informações
        //Treats the file to manipulate information
        data = data.trim().split('InitGame:');
        data = data.map((e) => e.trim().split('\n'));
        data.shift();

        data = data.reduce((acc, game, i) => {
            let total_kills = 0;
            let players = [];
            let p_kills = {};
            let world_kills = 0;
            let weap_kills = {};

            let regex = /^ (\d+:\d+) Kill: (\d+) (\d+) (\d+): ([^ ]+) killed ([^ ]+) by (.+)$/;
            let regexPlayer = /ClientUserinfoChanged: (\d+) n\\([^\\]+)/g;

            for (let line of game) {
                //Salva o nome dos players que entraram na partida
                //Saves the names of players who joined the match
                let matches = line.match(regexPlayer);
                if (matches) {
                    matches.forEach(match => {
                        let playerName = match.split("\\")[1];
                        players.push(playerName);
                    });
                }

                //Salva a quantidade de mortes da partida e quem abateu
                //Saves death quantity of the match and who killed
                let matchKill = line.match(regex);
                if (matchKill) {
                    total_kills++;
                    let killerName = matchKill[5];
                    let victimName = matchKill[6];
                    let action = matchKill[7];

                    if (killerName === "<world>") {
                        world_kills++;
                        if (p_kills[victimName]) {
                            p_kills[victimName]--;
                        }
                    } else {
                        if (p_kills[killerName]) {
                            p_kills[killerName]++;
                        } else {
                            p_kills[killerName] = 1;
                        }
                    }
                    //Salva as mortes por tipos de arma/dano
                    //Save the deaths by gun/damage types
                    if (weap_kills[action]) {
                        weap_kills[action]++;
                    } else {
                        weap_kills[action] = 1;
                    }
                }
            }
            //Filtra os nomes repetidos dos jogadores
            //Filter players repeated names
            players = players.filter((item, index) => players.indexOf(item) === index);

            acc[`game_${i + 1}`] = { 'total_kills': total_kills, 'players': players, 'p_kills': p_kills, 'world_kills': world_kills, 'weap_kills': weap_kills };
            return acc;
        }, {});

        callback(null, data);
    });
}

module.exports = parseLogFile;
