let table = new Vue({
    el: "#app1",
    mounted() {
        this.getUrlVars()
        this.getData()
        this.shipTable()
        this.salvoTable()
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
        occurence: 0,
        alertMsg: false,
        shipCurrentLoc: [],
        newPositions: [],
        fullCell: false,
        gameState: "placingShips",
        shipPositions: [{
                type: "Carrier",
                locations: ["A1", "B1", "C1", "D1", "E1"],
                length: 5
            },
            {
                type: "Submarine",
                locations: ["H5", "H6", "H7"],
                length: 3
            },
            {
                type: "Battleship",
                locations: ["A5", "A6", "A7", "A8"],
                length: 4
            },
            {
                type: "PatrolBoat",
                locations: ["E5", "E6"],
                length: 2
            },
            {
                type: "Destroyer",
                locations: ["D3", "E3", "F3"],
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

                    table.shipLocs = table.shipPositions
                    console.log(table.shipLocs)
                    console.log(gameJson.game.ships.length)

                    if (gameJson.game.ships.length != 0) {
                        table.shipLocs = gameJson.game.ships
                        table.gameState = "playing"
                    }

                    table.salvoLocs = gameJson.game.MySalvoes;
                    table.oppSalvoLocs = gameJson.game.OpponentSalvoes;
                    table.userName = gameJson.game.gamePlayer;
                    table.showPlayers();
                    table.gameVersus();
                    table.showShips();
                    table.showSalvoes();
                    table.showOpponentSalvoes();
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

            for (let i = 0; i < ships.length; i++) {
                let locs = ships[i].locations;
                let types = ships[i].type;

                for (let j = 0; j < locs.length; j++) {
                    document.getElementById(locs[j]).classList.add("shipColor");
                    document.getElementById(locs[j]).setAttribute('data-shipLength', locs.length);
                    document.getElementById(locs[j]).setAttribute('data-shipLocs', locs);
                    document.getElementById(locs[j]).setAttribute('data-shipType', types);
                    document.getElementById(locs[j]).classList.add(types);

                    if (j == 0) {
                        document.getElementById(locs[j]).setAttribute("draggable", "true");
                        document.getElementById(locs[j]).classList.add("rotateShip")
                    }

                    if (document.getElementById(locs[j]).classList.contains("shipColor")) {
                        document.getElementById(locs[j]).classList.remove("empty");
                    }

                    let empties = document.getElementsByClassName("empty");
                    let filled = document.getElementsByClassName("shipColor");
                    let indicators = document.getElementsByClassName("indicator");

                    if (table.gameState == "placingShips") {
                        for (let empty of empties) {
                            empty.addEventListener("dragover", this.dragOver);
                            empty.addEventListener("dragenter", this.dragEnter);
                            empty.addEventListener("dragleave", this.dragLeave);
                            empty.addEventListener("drop", this.dragDrop);
                        }

                        for (let fill of filled) {
                            fill.addEventListener("dragstart", this.dragStart);
                        }

                        for (let indicator of indicators) {
                            indicator.addEventListener("dragover", this.dragOver);
                            indicator.addEventListener("dragenter", this.dragEnter);
                        }
                    }
                }
            }

            table.addRotateShip();
        },
        rotateShip(e) {

            let currentID = e.target.id; //gets the dom element
            let letter = e.target.id.substr(0, 1);
            let number = e.target.id.substr(1, 2);

            let boatLoc = []; //selected ship locs
            let targeted = document.getElementById(currentID).getAttribute("data-shipType") //type of ship, e.g. 'BattleShip'
            let getShipType = document.getElementsByClassName(targeted); //gets all of the ship cells according the ship type

            for (let i = 0; i < getShipType.length; i++) {
                boatLoc.push(getShipType[i].id)
            }

            let isVerticalNow = Boolean;

            for (let i = 0; i < boatLoc.length - 1; i++) {
                if (boatLoc[i][0] != boatLoc[i + 1][0]) {
                    isVerticalNow = true;
                } else {
                    isVerticalNow = false;
                }
            }

            let shipLength = boatLoc.length;
            let newIDs = []

            if (isVerticalNow == true) {
                for (let i = 0; i < shipLength; i++) {
                    let newID = letter + (Number(number) + i);
                    newIDs.push(newID)
                }
            } else {
                for (let i = 0; i < shipLength; i++) {
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

            let newIDsLength = newIDs.length;

            if (isVerticalNow == true) {
                //if ship is vertical, change it to horizontal
                isVerticalNow = false;

            } else {
                //if ship is horizontal, change it to vertical
                isVerticalNow = true;
            }

            let locsOutGrid = [];
            let emptyCell = [];

            for (let i = 0; i < shipLength; i++) {
                locsOutGrid.push(document.getElementById(newIDs[i]));
            }

            if (!locsOutGrid.includes(null)) {

                for (let i = 1; i < shipLength; i++) { // 'i' has to start a 1 and not zero, as the boat rotate to himself
                    if (locsOutGrid[i].classList.contains("empty") == false) {
                        emptyCell.push(false) //cell is full
                    } else {
                        emptyCell.push(true) //cell is empty
                    }
                }
            }

            if (locsOutGrid.includes(null) || emptyCell.includes(false)) {
                alert("You cant place on top of another ship")
            } else {
                this.removeOldShip(boatLoc)
                //  salvo.fillGridAfterReorientation(TargetedBoatType, newIDs);
                this.makeRotatedShip(newIDs, targeted, newIDsLength)
            }
        },

        addRotateShip() {
            if (table.gameState == "placingShips") {
                let rotateButton = document.getElementsByClassName("rotateShip")
                for (let i = 0; i < rotateButton.length; i++) {
                    rotateButton[i].innerHTML = "<img src=./styles/rotate.png width='10px' height='10px'>";
                    rotateButton[i].addEventListener("click", this.rotateShip)
                }
            }
        },
        dragStart(e) {
            table.occurence = 0; //necessary so that the alert msg doesnt pop up more than once
            table.alertMsg = false; //should start as false otherwise the alert msg will keep on popping up
            let letter = e.target.id.substr(0, 1);
            let number = e.target.id.substr(1, 2);

            this.shipLength = document.getElementById(e.target.id).getAttribute("data-shipLength");
            this.shipType = document.getElementById(e.target.id).getAttribute("data-shipType");
            this.shipCurrentLoc = document.getElementById(e.target.id).getAttribute("data-shipLocs");

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
            //add and remove attributes/classes in order to make the ship disappear until placed again
            this.removeOldShip(table.allIDs)
        },

        dragOver(e) {
            //dragOver is necessary otherwise the ship goes back to its original place
            e.preventDefault();

            let shipCellID = e.target.id;
            let letter = shipCellID.substr(0, 1);
            let number = shipCellID.substr(1, 2);

            let newIDs = []

            if (shipCellID.length == 0) {
                table.outOfGrid = true;
            }

            if (table.isVertical == false) {
                for (let i = 0; i < this.shipLength; i++) {
                    let newID = letter + (Number(number) + i)
                    newIDs.push(newID)
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
        },

        dragLeave(e) {
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
                    if (document.getElementById(newIDs[i]) == null) {} else if (!document.getElementById(newIDs[i]).classList.contains("shipColor")) {
                        document.getElementById(newIDs[i]).classList.remove("shipColor");
                        document.getElementById(newIDs[i]).classList.remove("rotateShip");
                        document.getElementById(newIDs[i]).innerHTML = "";
                        document.getElementById(newIDs[i]).removeEventListener("click", this.rotateShip);
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

            let shipCellID = e.target.id;
            let letter = shipCellID.substr(0, 1);
            let number = shipCellID.substr(1, 2);

            let newIDs = []

            if (table.isVertical == false) {
                for (let i = 0; i < this.shipLength; i++) {

                    let newID = letter + (Number(number) + i)
                    newIDs.push(newID)
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

            for (let i = 0; i < newIDs.length; i++) {
                if (document.getElementById(newIDs[i]) == null) {
                    table.outOfGrid = true;
                } else if (document.getElementById(newIDs[i]).classList.contains("shipColor")) {
                    table.fullCell = true;
                    break;
                } else {
                    table.fullCell = false;
                    table.outOfGrid = false;
                }
            }

            let outSide = e.target.getAttribute("class");

            if (outSide == "indicator") {
                if (this.alertMsg == false && this.occurence < 1) {
                    this.makeShip(table.allIDs)
                    alert("You can't get outside the grid")
                }

                table.occurence++;
                table.alertMsg = true;
            }

        },

        dragDrop(e) {

            let shipCellID = e.target.id;

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

            if (table.fullCell == true || table.outOfGrid == true) {
                //table.allIDs has the initial starting locations
                this.makeShip(table.allIDs)

            } else if (table.fullCell == false || table.outOfGrid == false) {
                this.makeShip(newAllIDs)
            }
        },

        showSalvoes() {
            let salvoes = table.salvoLocs;

            for (let i = 0; i < salvoes.length; i++) {
                let locs = salvoes[i].locations;
                let turns = salvoes[i].turn;

                for (let j = 0; j < locs.length; j++) {
                    document.getElementById(locs[j] + "opp").style.backgroundColor = "orange";
                    document.getElementById(locs[j] + "opp").innerHTML = "S" + " " + turns;
                }
            }
        },
        showOpponentSalvoes() {
            let salvoes = table.oppSalvoLocs;
            let ships = table.shipLocs;
            let shipLoc = [];

            for (let j = 0; j < ships.length; j++) {
                let tempShipLoc = ships[j].locations;

                for (let z = 0; z < tempShipLoc.length; z++) {

                    shipLoc.push(tempShipLoc[z])
                }
            }

            if (salvoes != undefined) {
                for (let i = 0; i < salvoes.length; i++) {
                    let oppSalvo = salvoes[i].locations;
                    let oppTurn = salvoes[i].turn;

                    for (let y = 0; y < oppSalvo.length; y++) {
                        if (shipLoc.includes(oppSalvo[y])) {
                            document.getElementById(oppSalvo[y]).innerHTML = "H" + " " + oppTurn;
                        } else {
                            document.getElementById(oppSalvo[y]).innerHTML = "M" + " " + oppTurn;
                        }
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
        removeOldShip(shipId) {
            for (let i = 0; i < shipId.length; i++) {
                document.getElementById(shipId[i]).removeAttribute("class");
                document.getElementById(shipId[0]).removeAttribute("draggable");
                document.getElementById(shipId[0]).innerHTML = "";
                document.getElementById(shipId[i]).removeAttribute("data-shipLength");
                document.getElementById(shipId[i]).removeAttribute("data-shipType");
                document.getElementById(shipId[i]).removeAttribute("data-shipLocs");
                document.getElementById(shipId[i]).classList.add("empty");
            }
        },
        makeRotatedShip(shipIDs, type, shipLength) {

            let types = table.shipLocs;

            for (let j = 0; j < shipLength; j++) {
                document.getElementById(shipIDs[j]).classList.add("shipColor")
                document.getElementById(shipIDs[j]).classList.add(type);
                document.getElementById(shipIDs[0]).classList.add("rotateShip");
                document.getElementById(shipIDs[0]).addEventListener("click", this.rotateShip);
                document.getElementById(shipIDs[j]).classList.remove("empty")
                // document.getElementById(newAllIDs[i]).classList.remove("notAllowed")
                document.getElementById(shipIDs[0]).setAttribute("draggable", "true");
                document.getElementById(shipIDs[j]).setAttribute('data-shipType', type);
                document.getElementById(shipIDs[j]).setAttribute('data-shipLocs', table.shipCurrentLoc);
                document.getElementById(shipIDs[0]).addEventListener("dragstart", this.dragStart);
                document.getElementById(shipIDs[j]).setAttribute("data-shipLength", shipLength);

                for (let x = 0; x < types.length; x++) {
                    if (type == types[x].type) {
                        types[x].locations = shipIDs;
                        table.newPositions = types;
                    }
                }
            }
            table.addRotateShip();
            table.allIDs = [];
        },
        makeShip(shipID) {

            let types = table.shipLocs;

            for (let j = 0; j < shipID.length; j++) {
                document.getElementById(shipID[j]).classList.add("shipColor")
                document.getElementById(shipID[j]).classList.add(table.shipType);
                document.getElementById(shipID[j]).classList.remove("empty")
                document.getElementById(shipID[0]).classList.add("rotateShip");
                document.getElementById(shipID[0]).addEventListener("click", this.rotateShip);
                // document.getElementById(newAllIDs[i]).classList.remove("notAllowed")
                document.getElementById(shipID[0]).setAttribute("draggable", "true");
                document.getElementById(shipID[j]).setAttribute('data-shipType', table.shipType);
                document.getElementById(shipID[j]).setAttribute('data-shipLocs', table.shipCurrentLoc);
                document.getElementById(shipID[0]).addEventListener("dragstart", this.dragStart);
                document.getElementById(shipID[j]).setAttribute("data-shipLength", table.allIDs.length);

                for (let x = 0; x < types.length; x++) {
                    if (this.shipType == types[x].type) {
                        types[x].locations = shipID;
                        table.newPositions = types;
                    }
                }
                table.addRotateShip();
            }
            table.allIDs = [];
        },
        getUrlVars() {
            let vars = {};
            let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars = value; //gets the ID as a value instead of a string to make sure the data is working properly
            });
            return this.linkID = vars;
        },
        getPlayerShips() {
            let gamePlayerID = this.linkID.substr(0, 2)
            let newLocs = this.newPositions;
            console.log(newLocs)

            let url = "/api/games/players/" + gamePlayerID + "/ships"

            fetch(url, {
                    credentials: 'include',
                    mode: 'cors',
                    cache: 'default',
                    headers: {
                        'Accept': 'application/json', //accept is for what we are expecting to receive
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(newLocs)
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
                })
                .catch(error => console.log(error))
        }
    }
});