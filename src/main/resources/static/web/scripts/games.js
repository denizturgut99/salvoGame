let app = new Vue({
    el: "#app",
    mounted() {
        this.getAllData();
        this.userCheck();
    },
    data: {
        gameData: [],
        gameScores: [],
        leaderBoard: [],
        currentPlayer: [],
        gamePlayerID: [],
        emailInput: "",
        passInput: ""
    },
    methods: {
        getAllData() {
            let url = "/api/games";

            fetch(url, {
                    mode: "cors",
                })
                .then(function (response) {
                    return response.json()
                })
                .then(function (gameJson) {
              
                
                    app.gameData = gameJson.games;
                    app.currentPlayer = gameJson.current;
                    app.getScores();
                    app.getFilteredPlayers();
                    //                    console.log(app.gameData);
                })
                .catch(error => console.log(error));
        },
        getScores() {
            let games = app.gameData;

            for (let i = 0; i < games.length; i++) {
                let sc = games[i].scores;
                //                console.log(sc);
                app.gameScores.push(sc); //player and score gets pushed into gameScore
            }
        },
        getFilteredPlayers() {
            let players = app.gameScores;
            let filtered = []; //this has the unique player names
            let playerScores = []; //this has each match score
            let pl = []; //this has filtered players with their scores

            //looping over the players variable to get the unique players and start constructing the leaderboard data
            for (let i = 0; i < players.length; i++) {
                //playerScores gets all of the data here for future use
                players[i].map(score => {
                    playerScores.push(score)
                    //if filtered array doesnt have the player name the function pushes the names into filtered
                    if (!filtered.includes(score.player)) {

                        filtered.push(score.player)
                        //individual player data for future use
                        pl.push({
                            name: score.player, //this is the player name
                            win: 0,
                            lose: 0,
                            tie: 0,
                            pts: 0,
                            all: 0
                        })

                    }
                })
            }
            //            console.log(filtered)
            //            console.log(playerScores)
            //            console.log(pl)

            //calculate the player wins, ties and losses
            for (let i = 0; i < filtered.length; i++) {
                for (let j = 0; j < playerScores.length; j++) {
                    //if the filtered array has the player from playerScores a set of methods are called
                    if (filtered[i] === playerScores[j].player) {

                        //the pl data table has pts object and here the player's score is added into it in order to have the total score of that player
                        pl[i].pts += playerScores[j].score

                        //possible outcomes are checked here
                        switch (playerScores[j].score) {
                            //if the player has the score of 1.0 their wins increase
                            case 1.0:
                                pl[i].win++
                                pl[i].all++
                                break;
                                //if the player has the score of 0.5 their ties increase
                            case 0.5:
                                pl[i].tie++
                                pl[i].all++
                                break;
                                //if the player has the score of 0.0 their losses increase    
                            case 0.0:
                                pl[i].lose++
                                pl[i].all++
                                break;
                        }
                    }
                }
            }
            //            this.leaderBoard = pl
            //sorts the total score from highest to the lowest
            var sortedValues = pl.sort((a, b) => a.pts < b.pts ? 1 : a.pts > b.pts ? -1 : 0);
            //            var sortedValues2 = pl.sort((a, b) => a.pts > b.pts ? 1 : a.win > b.win ? -1 : 0);

            for (let i = 0; i < sortedValues.length; i++) {
                for (let j = i + 1; j < sortedValues.length; j++) {
                    if (sortedValues[i].pts == sortedValues[j].pts) {
                        this.leaderBoard = sortedValues;
                    }
                    //                    else if (sortedValues[i].pts > sortedValues[j].pts) {
                    //                        this.leaderBoard = sortedValues;
                    //                    }
                }
            }
        },
        userCheck() {
            function login(evt) {
                evt.preventDefault();
                var form = evt.target.form;
                $.post("/api/login", {
                        userName: form["username"].value,
                        password: form["password"].value
                    })
                    .done()
                    .fail();
            }

            function logout(evt) {
                evt.preventDefault();
                $.post("/api/logout")
                    .done()
                    .fail();
            }
        },
        getBody(user) {
            let body = [];
            for (var key in user) {
                let encKey = encodeURIComponent(key);
                let encVal = encodeURIComponent(user[key]);
                body.push(encKey + "=" + encVal);
            }
            return body.join("&");
            console.log(body);
        },
        login() {
            fetch("/api/login", {
                    credentials: 'include', //keeps you logged in
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'

                    },
                    method: 'POST',
                    body: this.getBody({
                        userName: this.emailInput,
                        password: this.passInput
                    })
                })
                .then(function (data) {
                    if (data.status >= 400) {
                        alert("Please check your UserName/Email and password")
                    } else {
                        location.reload(true)
                        console.log("ALL good!")
                    }
                })
                .catch(function (error) {
                    console.log('Request failure: ', error);
                });
        },
        logout() {
            fetch("/api/logout", {
                    method: "POST",
                })
                .then(function (gameJson) {
                    console.log("Log out success")
                })
                .then(function () {
                    location.reload(true)
                })
                .catch(error => console.log(error))
        },
        signup() {
            fetch("/api/players", {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        userName: this.emailInput,
                        password: this.passInput
                    })
                })
                .then(function (data) {
                    if (data.status == 409) {
                        alert("This user already exists")
                    } else if (data.status >= 400) {
                        alert("Please check your UserName/Email and password")
                    } else {
                        app.login();
                        console.log("ALL good!")
                    }
                })
                .catch(function (error) {
                    console.log("oops something failed ", error);
                })
        },
        gamePlayerPage() {
            let current = app.currentPlayer;
            let data = app.gameData;
            let gameID = [];
            let gamePlayer = [];
            let gamePlayerID = [];

            for (let i = 0; i < data.length; i++) {
                gameID.push(data[i].gamePlayer)
            }

            for (let i = 0; i < gameID.length; i++) {
                for (let j = 0; j < gameID[i].length; j++) {
                    gamePlayer.push(gameID[i][j])
                }
            }
            //            console.log(gamePlayer)

            for (let i = 0; i < gamePlayer.length; i++) {
                if (current.id == gamePlayer[i].player.id) {
                    gamePlayerID.push(gamePlayer[i].id)
                }
            }
            //            console.log(gamePlayerID)
            app.gamePlayerID.push(gamePlayerID);
        },
        createLink(test) {
            let matchingID = [];

            for (let i = 0; i < test.length; i++) {
                if (test[i].player.player == this.currentPlayer.player) {
                    matchingID = test[i].id
                }
            }
            return window.location = "http://localhost:8080/web/game.html?gp=" + matchingID;
        }
    }

})
