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
        isVertical: false,
        shipLength: null,
        outOfGrid: false,
        shipType: "",
        allIDs: [],
        shipCurrentLoc: [],
        fullCell: false,
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
                type: "PatrolBoat",
                locations: [],
                length: 2
            },
            {
                type: "Destroyer",
                locations: [],
                length: 3
            }
        ]
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

                })
                .catch(error => console.log(error));
        },
        showPlayers() {
            let players = table.userName;
            for (let i = 0; i < players.length; i++) {
                let users = players[i].player.player;
                if (!table.matchPlayers.includes(users)) {
                    table.matchPlayers.push(users)
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
                let types = ships[i].type;

                for (let j = 0; j < locs.length; j++) {
                    document.getElementById(locs[j]).classList.add("shipColor");
                    document.getElementById(locs[j]).setAttribute('data-shipLength', locs.length);
                    document.getElementById(locs[j]).setAttribute('data-shipLocs', locs);
                    document.getElementById(locs[j]).setAttribute('data-shipType', types);
                    document.getElementById(locs[j]).classList.add(types);

                    if (j == 0) {
                        document.getElementById(locs[j]).setAttribute("draggable", "true");
                    }

                    if (document.getElementById(locs[j]).classList.contains("shipColor")) {
                        document.getElementById(locs[j]).classList.remove("empty");
                    }

                    let empties = document.getElementsByClassName("empty");
                    let filled = document.getElementsByClassName("shipColor");

                    for (let empty of empties) {
                        empty.addEventListener("dragover", this.dragOver);
                        empty.addEventListener("dragenter", this.dragEnter);
                        empty.addEventListener("dragleave", this.dragLeave);
                        empty.addEventListener("drop", this.dragDrop);
                    }

                    for (let fill of filled) {
                        fill.addEventListener("dragstart", this.dragStart);
                        fill.addEventListener("dragend", this.dragEnd);
                    }
                }
            }
        },
        dragStart(e) {
            console.log("START", e.target.id);
            let letter = e.target.id.substr(0, 1);
            let number = e.target.id.substr(1, 2);

            let locs = table.shipLocs;

            this.shipLength = document.getElementById(e.target.id).getAttribute("data-shipLength");
            this.shipType = document.getElementById(e.target.id).getAttribute("data-shipType");
            this.shipCurrentLoc = document.getElementById(e.target.id).getAttribute("data-shipLocs");

            console.log("THIS IS THE CURRENT SHIP LOCATION " + this.shipCurrentLoc);

            //check if vertical
            let boatLoc = [];
            let getShipType = document.getElementsByClassName(table.shipType);

            for (let i = 0; i < getShipType.length; i++) {
                boatLoc.push(getShipType[i].id)
            }

            for (let i = 0; i < boatLoc.length - 1; i++) {
                if (boatLoc[i][0] != boatLoc[i + 1][0]) {
                    table.isVertical = true;
                } else {
                    table.isVertical = false;
                }
            }

            if (table.isVertical == false) {
                for (let i = 0; i < this.shipLength; i++) {
                    let newID = letter + (Number(number) + i);
                    table.allIDs.push(newID)
                }
            } else {
                for (let i = 0; i < this.shipLength; i++) {
                    const letters = "ABCDEFGHIJ";
                    const newLetters = letters.split("");

                    for (let y = 0; y < newLetters.length; y++) {
                        if (e.target.id[0] == newLetters[y]) {
                            let newID = newLetters[y + i] + (Number(number));
                            table.allIDs.push(newID);
                        }
                    }
                }
            }
            console.log("ALL IDS " + table.allIDs)

            //add and remove attributes/classes in order to make the ship disappear until placed again
            for (let i = 0; i < table.allIDs.length; i++) {
                document.getElementById(table.allIDs[i]).removeAttribute("class");
                document.getElementById(table.allIDs[0]).removeAttribute("draggable");
                document.getElementById(table.allIDs[i]).removeAttribute("data-shipLength");
                document.getElementById(table.allIDs[i]).removeAttribute("data-shipType");
                document.getElementById(table.allIDs[i]).removeAttribute("data-shipLocs");
                document.getElementById(table.allIDs[i]).classList.add("empty");
            }
        },

        dragEnd(e) {
            console.log("END", e.target.id);
        },

        dragOver(e) {
            //dragOver is necessary otherwise the ship goes back to its original place
            e.preventDefault();
            console.log("OVER", e.target.id);

            let shipCellID = e.target.id;
            let letter = shipCellID.substr(0, 1);
            let number = shipCellID.substr(1, 2);

            let newIDs = []

            for (let i = 0; i < this.shipLength; i++) {
                let newID = letter + (Number(number) + i)
                newIDs.push(newID);
            }
        },

        dragLeave(e) {
            console.log("LEAVE", e.target.id);
            let letter = e.target.id.substr(0, 1);
            let number = e.target.id.substr(1, 2);
            //remove the ships here

            let newIDs = []

            for (let i = 0; i < this.shipLength; i++) {
                let newID = letter + (Number(number) + i);
                newIDs.push(newID)
            }

            if (table.fullCell == false) {
                for (let i = 0; i < newIDs.length; i++) {
                    if (document.getElementById(newIDs[i]) == null) {
                        table.outOfGrid = true;
                    } else if (!document.getElementById(newIDs[i]).classList.contains("shipColor")) {
                        document.getElementById(newIDs[i]).classList.remove("shipColor");
                        document.getElementById(newIDs[i]).classList.remove(table.shipType);
                        document.getElementById(newIDs[i]).removeAttribute("draggable");
                        document.getElementById(newIDs[i]).removeAttribute("data-shipLength");
                        document.getElementById(newIDs[i]).removeAttribute("data-shipType");
                        document.getElementById(newIDs[i]).removeAttribute("data-shipLocs");
                        document.getElementById(newIDs[i]).classList.add("empty");
                    }
                }
            }

        },

        dragEnter(e) {
            e.preventDefault();
            console.log("ENTER", e.target.id);

            let id = e.target;

            let shipCellID = e.target.id;
            let letter = shipCellID.substr(0, 1);
            let number = shipCellID.substr(1, 2);

            let newIDs = []

            if(table.isVertical == false) {
                for (let i = 0; i < this.shipLength; i++) {
                    if ((Number(number) + i) > 10) {
                        table.outOfGrid = true;
                        let newID = letter + (Number(number) + i)
                        newIDs.push(newID)
                    } else {
                        table.outOfGrid = false;
                        let newID = letter + (Number(number) + i)
                        newIDs.push(newID)
                    }
                }
            } else {
                for (let i = 0; i < this.shipLength; i++) {
                    const letters = "ABCDEFGHIJ";
                    const newLetters = letters.split("");

                    for (let y = 0; y < newLetters.length; y++) {
                        if (e.target.id[0] == newLetters[y]) {
                            let newID = newLetters[y + i] + (Number(number));
                            newIDs.push(newID);
                        }
                    }
                }
            }

            console.log("DRAG ENTER NEW LOCATIONS " + newIDs)

            for (let i = 0; i < newIDs.length; i++) {
                // table.fullCell = false;
                if (document.getElementById(newIDs[i]) == null) {
                    table.outOfGrid = true;
                } else if (document.getElementById(newIDs[i]).classList.contains("shipColor")) {
                    table.fullCell = true;
                    break;
                } else {
                    table.fullCell = false;
                }
            }
        },

        dragDrop(e) {
            console.log("DROP", e.target.id);

            let shipCellID = e.target.id;
            console.log(shipCellID)

            let types = table.shipLocs;

            let letter = shipCellID.substr(0, 1);
            let number = shipCellID.substr(1, 2);

            let newAllIDs = []

            if (table.isVertical == false) {
                for (let i = 0; i < this.shipLength; i++) {
                    let newID = letter + (Number(number) + i)
                    newAllIDs.push(newID)
                }
            } else {
                for (let i = 0; i < this.shipLength; i++) {
                    const letters = "ABCDEFGHIJ";
                    const newLetters = letters.split("");

                    for (let y = 0; y < newLetters.length; y++) {
                        if (e.target.id[0] == newLetters[y]) {
                            let newID = newLetters[y + i] + (Number(number));
                            newAllIDs.push(newID);
                        }
                    }
                }
            }
            console.log(newAllIDs)

            for (let i = 0; i < newAllIDs.length - 1; i++) {
                if (table.fullCell == true || table.outOfGrid == true || document.getElementById(shipCellID).classList.contains("indicator")) {
                    console.log("IF CELL IS FULL THIS FUNCTION RUNS")
                    //table.allIDs has the initial starting locations
                    for (let j = 0; j < table.allIDs.length; j++) {
                        document.getElementById(table.allIDs[j]).classList.add("shipColor")
                        document.getElementById(table.allIDs[j]).classList.add(table.shipType);
                        document.getElementById(table.allIDs[j]).classList.remove("empty")
                        document.getElementById(newAllIDs[i]).classList.remove("notAllowed")
                        document.getElementById(table.allIDs[0]).setAttribute("draggable", "true");
                        document.getElementById(table.allIDs[j]).setAttribute('data-shipType', table.shipType);
                        document.getElementById(table.allIDs[j]).setAttribute('data-shipLocs', table.shipCurrentLoc);
                        document.getElementById(table.allIDs[0]).addEventListener("dragstart", this.dragStart);
                        document.getElementById(table.allIDs[j]).setAttribute("data-shipLength", table.allIDs.length);

                        for (let x = 0; x < types.length; x++) {
                            if (this.shipType == types[x].type) {
                                types[x].location = table.allIDs;
                            }
                        }

                    }
                    table.allIDs = [];

                } else if (table.fullCell == false || table.outOfGrid == false) {
                    for (let i = 0; i < newAllIDs.length; i++) {
                        console.log("if full cell is FALSE this function runs")
                        document.getElementById(newAllIDs[i]).classList.add("shipColor")
                        document.getElementById(newAllIDs[i]).classList.add(table.shipType);
                        document.getElementById(newAllIDs[i]).classList.remove("notAllowed")
                        document.getElementById(newAllIDs[i]).classList.remove("empty")
                        document.getElementById(newAllIDs[0]).setAttribute("draggable", "true");
                        document.getElementById(newAllIDs[i]).setAttribute('data-shipType', table.shipType);
                        document.getElementById(newAllIDs[i]).setAttribute('data-shipLocs', newAllIDs);
                        document.getElementById(newAllIDs[0]).addEventListener("dragstart", this.dragStart);
                        document.getElementById(newAllIDs[i]).setAttribute("data-shipLength", newAllIDs.length);

                        for (let j = 0; j < types.length; j++) {
                            if (this.shipType == types[j].type) {
                                types[j].location = newAllIDs;
                            }
                        }
                    }
                    table.allIDs = [];
                }
            }

        },

        showSalvoes() {
            let salvoes = table.salvoLocs;

            for (let i = 0; i < salvoes.length; i++) {
                let locs = salvoes[i].location;
                let turns = salvoes[i].turn;

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
                        td.classList.add("indicator")
                        td.style.backgroundColor = "black";
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        td.classList.remove("empty");
                        td.classList.add("indicator")
                        td.style.backgroundColor = "black";
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
                        td.style.backgroundColor = "black";
                        //number start from 1 and the very first cell gets left empty
                    }

                    if (i >= 0 && j == 0) {
                        td.textContent = letters[i];
                        td.style.backgroundColor = "black";
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
                            "locations": ["A1", "B1", "C1", "D1", "E1"],
                            "length": 5
                        },
                        {
                            "type": "Submarine",
                            "locations": ["H5", "H6", "H7"],
                            "length": 3
                        },
                        {
                            "type": "Battleship",
                            "locations": ["A5", "A6", "A7", "A8"],
                            "length": 4
                        },
                        {
                            "type": "PatrolBoat",
                            "locations": ["E5", "E6"],
                            "length": 2
                        },
                        {
                            "type": "Destroyer",
                            "locations": ["D3", "E3", "F3"],
                            "length": 3
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