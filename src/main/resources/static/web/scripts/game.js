let table = new Vue({
    el: "#app1",
    mounted() {
        this.getUrlVars();
        this.getData();
        this.shipTable();
        this.salvoTable();
    },
    data: {
        gameData: [],
        linkID: [],
        shipLocs: [],
        userName: [],
        matchPlayers: [],
        salvoLocs: [],
        oppID: [],
        oppSalvoLocs: [],
    },
    methods: {
        getData() {
            let url = "/api/game_view/" + this.linkID;
            fetch(url, {
                    mode: "cors",
                })
                .then(function (response) {
                    return response.json()
                })
                .then(function (gameJson) {
                
              
                if(gameJson.hasOwnProperty('error')) {
                    alert(gameJson.error)
                    history.go(-1)
                }
                    table.gameData = gameJson;
                    table.shipLocs = gameJson.game.ships;
                    table.salvoLocs = gameJson.game.MySalvoes;
                    table.oppSalvoLocs = gameJson.game.OpponentSalvoes;
                    table.userName = gameJson.game.gamePlayer;
                    table.showShips();
                    table.showSalvoes();
                    table.showOpponentSalvoes();
                    table.showPlayers();
                    table.gameVersus();
                })
                .catch(error => console.log(error));
        },
        showPlayers() {
            let players = table.userName;
            //            console.log(players)
            for (let i = 0; i < players.length; i++) {
                let users = players[i].player.user;
                if (!table.matchPlayers.includes(users)) {
                    table.matchPlayers.push(users)
                    //                    console.log(table.matchPlayers)
                }
            }
        },
        gameVersus() {
            let playersInGame = document.getElementById("players");

            if (this.gameData.game.gamePlayer.length == 1) {
                let playerOne = table.gameData.game.gamePlayer[0].player.player

                playersInGame.textContent = playerOne + "Awaiting for a player"
            } else {
                let playerOne = table.gameData.game.gamePlayer[0].player.player;
                let playerTwo = table.gameData.game.gamePlayer[1].player.player;
                //if the player id matches the gamePlayer id

                //                console.log(table.gamePlayer)

                if (table.gameData.game.gamePlayer[0].id == this.linkID) {
                    playersInGame.textContent = playerOne + "(YOU) vs " + playerTwo;
                } else {
                    playersInGame.textContent = playerTwo + "(YOU) vs " + playerOne;
                }
            }
        },
        showShips() {
            let ships = table.shipLocs;
            //            console.log(ships);

            for (let i = 0; i < ships.length; i++) {
                let locs = ships[i].location;
                //                console.log(locs)

                for (let j = 0; j < locs.length; j++) {
                    document.getElementById(locs[j]).style.backgroundColor = "red";
                }
            }
        },
        showSalvoes() {
            let salvoes = table.salvoLocs;
            //            console.log(salvoes);

            for (let i = 0; i < salvoes.length; i++) {
                let locs = salvoes[i].location;
                let turns = salvoes[i].turn;
                //                console.log(locs)

                for (let j = 0; j < locs.length; j++) {
                    document.getElementById(locs[j] + "opp").style.backgroundColor = "orange";
                    document.getElementById(locs[j] + "opp").innerHTML = "Salvo" + " " + turns;
                }
            }
        },
        showOpponentSalvoes() {
            let salvoes = table.oppSalvoLocs;
            let ships = table.shipLocs;
            let shipLoc = [];
            
            for(let j = 0; j < ships.length; j++) {
               let tempShipLoc = ships[j].location;
            
                for (let z = 0; z < tempShipLoc.length ; z++ ){
                    
                    shipLoc.push(tempShipLoc[z])
                }
            }
            console.log(shipLoc)
            for(let i = 0; i < salvoes.length; i++) {
                let oppSalvo = salvoes[i].location;
                let oppTurn = salvoes[i].turn;
                console.log(oppTurn);
                
                for(let y = 0; y < oppSalvo.length; y++) {
                    if(shipLoc.includes(oppSalvo[y])) {
                        document.getElementById(oppSalvo[y]).innerHTML = "HIT" + " " + oppTurn;
                    } else {
                       document.getElementById(oppSalvo[y]).innerHTML = "MISS" + " " + oppTurn;
                    }
                }
            }
        },
        shipTable() {
            const letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
            let myTable = document.getElementById("table1");
            let table = document.createElement("table");
            let tableBody = document.createElement("tbody");
            table.appendChild(tableBody);

            for (let i = 0; i < letters.length; i++) {
                let tr = document.createElement("tr");
                tableBody.appendChild(tr);

                for (let j = 0; j < letters.length; j++) {
                    let td = document.createElement("td");
                    tr.appendChild(td)
                    td.setAttribute("id", letters[i] + j)

                    if (i == 0 && j > 0) {
                        td.textContent = j;
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        //the first element in the letters array gets ignored and put in the table, this also avoids the repetition of the letters array into the other cells
                    }
                }
            }
            myTable.appendChild(table)
            document.getElementById("0").removeAttribute("id")
        },
        salvoTable() {
            const letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
            let myTable = document.getElementById("table2");
            let table = document.createElement("table");
            let tableBody = document.createElement("tbody");
            table.appendChild(tableBody);

            for (let i = 0; i < letters.length; i++) {
                let tr = document.createElement("tr");
                tableBody.appendChild(tr);

                for (let j = 0; j < letters.length; j++) {
                    let td = document.createElement("td");
                    tr.appendChild(td)
                    td.setAttribute("id", letters[i] + j + "opp")

                    if (i == 0 && j > 0) {
                        td.textContent = j;
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        //the first element in the letters array gets ignored and put in the table, this also avoids the repetition of the letters array into the other cells
                    }
                }

            }
            myTable.appendChild(table)
            document.getElementById("0opp").removeAttribute("id")
        },
        getUrlVars() {
            let vars = {};
            let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {

                vars = value; //gets the ID as a value instead of a string to make sure the data is working properly
            });
            return this.linkID = vars;
        }
    }
});
