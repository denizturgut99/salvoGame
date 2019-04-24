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
        linkID: [], //this is the gameplayer ID but is used to construct correct links
        shipLocs: [],
        userName: [],
        matchPlayers: [],
        salvoLocs: [],
        oppID: [],
        oppSalvoLocs: [],
        playerShips: [],
        shipPositions: [{
                type: "Carrier",
                locations: [],
                lenth: 5
                       },
            {
                type: "Submarine",
                locations: [],
                length: 3
                       },
            {
                type: "Battleship",
                locations: [],
                length: 4
                                     },
            {
                type: "Patrol boat",
                locations: [],
                length: 2
                                         },
            {
                type: "Destroyer",
                locations: [],
                length: 3
                                     }]
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

                    if (gameJson.hasOwnProperty('error')) {
                        alert(gameJson.error)
                        history.go(-1)
                    }
                    console.log("after fetch")
                    table.gameData = gameJson;
                    table.shipLocs = gameJson.game.ships;
                    table.salvoLocs = gameJson.game.MySalvoes;
                    table.oppSalvoLocs = gameJson.game.OpponentSalvoes;
                    table.userName = gameJson.game.gamePlayer;
                    table.showPlayers();
                    table.gameVersus();
                    table.showShips();
                    table.showSalvoes();
                    table.showOpponentSalvoes();
                    table.dragShips();
                    //                    table.getUrlVars();
                    //                    table.getPlayerShips();

                })
                .catch(error => console.log(error));
        },
        showPlayers() {
            let players = table.userName;
            //            console.log(players)
            for (let i = 0; i < players.length; i++) {
                let users = players[i].player.player;
                if (!table.matchPlayers.includes(users)) {
                    table.matchPlayers.push(users)
                    //                    console.log(table.matchPlayers)
                }
            }
        },
        gameVersus() {
            let playersInGame = document.getElementById("players");

            if (this.gameData.game.gamePlayer.length == 1) {
                let playerOne = table.userName[0].player.player
                let playerTwo = "Awaiting for a player";

                playersInGame.textContent = playerOne + "(YOU) vs " + playerTwo
            } else {
                let playerOne = table.userName[0].player.player;
                let playerTwo = table.userName[1].player.player;
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
                    //                    document.getElementById(locs[j]).style.backgroundColor = "red";
                    document.getElementById(locs[j]).classList.add("shipColor");
                    document.getElementById(locs[j]).setAttribute("draggable", "true");

                    if (document.getElementById(locs[j]).classList.contains("shipColor")) {
                        document.getElementById(locs[j]).classList.remove("empty");
                    }

                    //                    let empties = document.getElementsByClassName("empty");
                    //                    let filled = document.getElementsByClassName("shipColor");
                    //
                    //                    for (let empty of empties) {
                    //                        empty.addEventListener("dragover", dragOver);
                    //                        empty.addEventListener("dragenter", dragEnter);
                    //                        empty.addEventListener("dragleave", dragLeave);
                    //                        empty.addEventListener("drop", dragDrop);
                    //                    }
                    //
                    //                    for (let fill of filled) {
                    //                        fill.addEventListener("dragstart", dragStart);
                    //                        fill.addEventListener("dragend", dragEnd);
                    //                    }
                    //
                    //                    function dragStart() {
                    //                        setTimeout(() => (this.classList.remove("shipColor")), 0);
                    //                    }
                    //
                    //                    function dragEnd() {
                    //                        this.className = "shipColor";
                    //                    }
                    //
                    //                    function dragOver(e) {
                    //                        e.preventDefault();
                    //                    }
                    //
                    //                    function dragEnter(e) {
                    //                        e.preventDefault();
                    //                        this.className = "entering";
                    //                    }
                    //
                    //                    function dragLeave() {
                    //                        this.className = "empty";
                    //                    }
                    //
                    //                    function dragDrop() {
                    //                      this.clasName = "empty";
                    //                        this.append(filled);
                    //                    }

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

            for (let j = 0; j < ships.length; j++) {
                let tempShipLoc = ships[j].location;

                for (let z = 0; z < tempShipLoc.length; z++) {

                    shipLoc.push(tempShipLoc[z])
                }
            }
            console.log(shipLoc)
            for (let i = 0; i < salvoes.length; i++) {
                let oppSalvo = salvoes[i].location;
                let oppTurn = salvoes[i].turn;
                console.log(oppTurn);

                for (let y = 0; y < oppSalvo.length; y++) {
                    if (shipLoc.includes(oppSalvo[y])) {
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
                    td.classList.add("empty")

                    if (i == 0 && j > 0) {
                        td.textContent = j;
                        td.classList.remove("empty");
                        td.style.backgroundColor = "gray";
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        td.classList.remove("empty");
                        td.style.backgroundColor = "gray";
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
                        td.style.backgroundColor = "gray";
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        td.style.backgroundColor = "gray";
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
        },
        getPlayerShips() {
            let url = "/api/games/players/" + table.linkID + "/ships"

            fetch(url, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json', //accept is for what we are expecting to receive
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify([{
                            "type": "Carrier",
                            "locations": ["A1", "B1", "C1", "D1", "E1"]
                       },
                        {
                            "type": "Submarine",
                            "locations": ["H5", "H6", "H7"]
                       },
                        {
                            "type": "Battleship",
                            "locations": ["A5", "A6", "A7", "A8"]
                                     },
                        {
                            "type": "Patrol boat",
                            "locations": ["E5", "E6"]
                                         },
                        {
                            "type": "Destroyer",
                            "locations": ["C3", "B3", "A3"]
                                     }

                               ])
                })
                .then(function (response) {
                    return response.json();
                })
                .then(function (gameJson) {
                    if (gameJson.hasOwnProperty('error')) {
                        alert(gameJson.error)
                    } else {
                        location.reload(true)
                    }
                    table.playerShips = gameJson;
                })
                .catch(error => console.log(error))
        }
    }
});
