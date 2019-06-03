package com.denizbattleship.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toList;
import java.util.stream.Stream;
import java.util.List;

@RestController

public class SalvoController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private ShipRepository shipRepository;

    @Autowired
    private SalvoRepository salvoRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    //public List<Object> all() {
    //return gameRepository.findAll().stream().map(g -> autPlayer(g)).collect(toList());
    //}

    @RequestMapping(path="/api/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {
        if(authentication != null) {
            //if there is a logged in player create a new game and save it into the game repo
            Game game1 = new Game(LocalDateTime.now());
            gameRepository.save(game1);

            //if there is a logged in player get the logged player info no need to save it to repo as this player already exists
            Player player1 = getLoggedPlayer(authentication);

            //gamePlayer saves both game and player into the gamePlayer repo which includes important info for both games and players
            GamePlayer gamePlayer = new GamePlayer(game1, player1);
            gamePlayerRepository.save(gamePlayer);

            return new ResponseEntity<>(checkInfo("gpid", gamePlayer.getId()), HttpStatus.CREATED);

        } else {
            return new ResponseEntity<>(checkInfo("error", "Please Log-In to be able to create games."), HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(path="/api/games/players/{gamePlayerID}/ships", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> playerShips(@PathVariable Long gamePlayerID, Authentication authentication, @RequestBody Set<Ship> ships) {
        if(authentication == null) {
            return new ResponseEntity<>(checkInfo("error", "You need to be logged in to place ships"), HttpStatus.UNAUTHORIZED);
        }

        GamePlayer gamePlayer = gamePlayerRepository.getOne(gamePlayerID);
        Player currentPlayer = getLoggedPlayer(authentication);

        if(gamePlayer.getPlayer().getId() != currentPlayer.getId()) {
            return new ResponseEntity<>(checkInfo("error", "You can't place ships for someone else!"), HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayer.getId() == null) {
            return new ResponseEntity<>(checkInfo("error", "Such game player doesn't exist."), HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayer.getShip().size() >= 5) {
            return new ResponseEntity<>(checkInfo("error", "You can only place 5 ships!"), HttpStatus.FORBIDDEN);
        }

        if (ships.size() != 5) {
            return new ResponseEntity<>(checkInfo("error", "Wrong number of ships!"), HttpStatus.FORBIDDEN);
        } else {

            for(Ship ship : ships){
                //gamePlayer.addShip(ship);
                ship.setGamePlayer(gamePlayer);
                shipRepository.save(ship);
            }

            return new ResponseEntity<>(checkInfo("OK", "Ships are saved."), HttpStatus.CREATED);

        }
    }

    @RequestMapping(path="/api/game/{gameID}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable Long gameID,Authentication authentication) {
        if(authentication == null) {
            return new ResponseEntity<>(checkInfo("error", "You need to be logged in to be able to join games"), HttpStatus.UNAUTHORIZED);
        } else {
            Player player1 = getLoggedPlayer(authentication);
            Game game1 = gameRepository.getOne(gameID);

            //forEach loop to go over all of the gameplayers and current player(s) in game
            for(GamePlayer gamePlayer : game1.getGamePlayers()) {
                //if the player in gameplayer is equal to the current player, an error message is returned and the user is not allowed to join the game again
                if(gamePlayer.getPlayer().equals(player1)) {
                    return new ResponseEntity<>(checkInfo("error", "You're already in this game"), HttpStatus.CONFLICT);
                }
            }

            if(game1 == null) {
                return new ResponseEntity<>(checkInfo("error", "Sorry, this game doesn't exist"), HttpStatus.FORBIDDEN);
            }

            if(game1.getGamePlayers().size() == 2) {
                return new ResponseEntity<>(checkInfo("error", "Game is full"), HttpStatus.FORBIDDEN);
            }

            GamePlayer gamePlayer = new GamePlayer(game1, player1);
            gamePlayerRepository.save(gamePlayer);

            return new ResponseEntity<>(checkInfo("gpid", gamePlayer.getId()), HttpStatus.CREATED);
        }
    }

    @RequestMapping(path = "/api/players", method = RequestMethod.POST)
    public ResponseEntity<String> createUser(@RequestBody Player player) {
        if (player.getUserName().isEmpty() || player.getPassword().isEmpty()) {
            return new ResponseEntity<>("No name given", HttpStatus.FORBIDDEN);
        }

        if (playerRepository.findByUserName(player.getUserName()) != null) {
            return new ResponseEntity<>("Name already in use", HttpStatus.CONFLICT);
        }

        player.setPassword(passwordEncoder.encode(player.getPassword()));

        playerRepository.save(player);
        return new ResponseEntity<>("Name added", HttpStatus.CREATED);
    }

    @RequestMapping(path="/api/games")
    public Map<String, Object> autPlayer(Authentication authentication) {
        Map<String, Object> dto = new HashMap<>();
        Set<Game> games = new LinkedHashSet<>(gameRepository.findAll());
        if(authentication != null) {
            dto.put("current", playerDTO(getLoggedPlayer(authentication)));
        } else {
            dto.put("current", "guest");
        }
        dto.put("games", games.stream().map(g -> gameDTO(g)).collect(toList()));

        return dto;
    }

    //place salvos
    @RequestMapping(path="/api/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> fireSalvos (@PathVariable Long gamePlayerId, @RequestBody List<String> salvos, Authentication authentication) {

        GamePlayer gamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
        Player currentPlayer = getLoggedPlayer(authentication);
        GamePlayer oppSalvoes = opponent(gamePlayer); //gets the opponent

        if(authentication == null) {
            return new ResponseEntity<>(checkInfo("error", "You have to be logged in to be able to play"), HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayerId == null) {
            return new ResponseEntity<>(checkInfo("error", "There is no player with this given game player id"), HttpStatus.UNAUTHORIZED);
        }

        if(gamePlayer.getPlayer().getId() != currentPlayer.getId()) {
            return new ResponseEntity<>(checkInfo("error", "You can't fire salvos for someone else other than yourself"), HttpStatus.UNAUTHORIZED);
        }

        int gpTurn = gamePlayer.getSalvo().size() + 1; //amount of salvos fired by the current player and add 1 more turn to identify the turn has been finished
        int oppTurn = oppSalvoes.getSalvo().size() + 1; //same thing but for the opponent

        if(gpTurn > oppTurn) {
            return new ResponseEntity<>(checkInfo("error", "Wait for your opponent to fire their salvoes"), HttpStatus.FORBIDDEN);
        }

        Map<String, String> stateOfGame = makeGameState(gamePlayer);
        String statusOfGame = stateOfGame.get("Status");

        //checking if the game is finished or its not user's turn yet
        //this is like a pre check, this should be checked before salvo is sent to the backend in order to stop players from continuing a finished game.
        if(!statusOfGame.equals("CONTINUE")) {
            return new ResponseEntity<>(checkInfo("error", "It's either not your turn or the game has been finished"), HttpStatus.FORBIDDEN);
        }

        Salvo salvo = new Salvo(gpTurn, salvos);

        gamePlayer.addSalvo(salvo); //each time a salvo is fired by a player, the salvoes get
        salvoRepository.save(salvo); //all fired salvoes are saved to the salvo repository
        System.out.println(salvo.getLocations());

        applyScores(makeGameState(gamePlayer), gamePlayer, oppSalvoes, gamePlayer.getGame());

        return new ResponseEntity<>(checkInfo("OK", "Salvo locations have been set!"), HttpStatus.CREATED);
    }

    public Map<String, Object> gamePlayerDTO(GamePlayer gamePlayer) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", gamePlayer.getId());
        dto.put("player", playerDTO(gamePlayer.getPlayer()));
        return dto;
    }

    public Player getLoggedPlayer(Authentication authentication) {
        if(authentication != null) {
            return playerRepository.findByUserName(authentication.getName());
        } else {
            return null;
        }
    }

    public boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private Map<String, Object> makeScoresDTO(Set<Score>scores) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("scores", scores.stream().map(score -> makeScoreDTO(score)).collect(toList()));
        return dto;
    }

    private Map<String, Object> makeScoreDTO(Score score) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("player", score.getPlayer().getUserName());
        dto.put("score", score.getScores());

        return dto;
    }

    private Map<String, Object> gameDTO(Game game) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", game.getId());
        dto.put("date", game.getDate());
        dto.put("gamePlayer", game.getGamePlayers()
                .stream()
                .map(gp -> gamePlayerDTO(gp))
                .collect(toList()));
        dto.put("scores", game.getScores()
                .stream()
                .map(sc -> makeScoreDTO(sc))
                .collect(toList()));
        return dto;
    }

    private Map<String, Object> playerDTO(Player player) {
        Map<String, Object> dto = new HashMap<>();

        dto.put("id", player.getId());
        dto.put("player", player.getUserName());
        return dto;
    }

    @RequestMapping("/api/game_view/{gamePlayerID}")
    public ResponseEntity<Map<String, Object>> checkCheater(@PathVariable Long gamePlayerID, Authentication authentication) {
        GamePlayer gamePlayer = gamePlayerRepository.getOne(gamePlayerID);

        if(gamePlayer.getPlayer().getId() != getLoggedPlayer(authentication).getId()) {
            return new ResponseEntity<>(checkInfo("error", "Stop cheating!"), HttpStatus.UNAUTHORIZED);
        } else {
            applyScores(makeGameState(gamePlayer), gamePlayer, opponent(gamePlayer), gamePlayer.getGame());
            return new ResponseEntity<>(gameViewId(gamePlayerID), HttpStatus.OK);
        }
    }
    public Map<String, Object> gameViewId(@PathVariable Long gamePlayerID) {
        Map<String, Object>  gameViewDTO = new HashMap<>();
        GamePlayer gamePlayer = gamePlayerRepository.getOne(gamePlayerID);

        gameViewDTO.put("game", gameViewInfo(gamePlayer));

        return gameViewDTO;
    }

    private Map<String, Object> gameViewInfo(GamePlayer gamePlayer) {
        Map<String, Object> gameInfo = new HashMap<>();

        gameInfo.put("id", gamePlayer.getGame().getId());
        gameInfo.put("date", gamePlayer.getGame().getDate());
        gameInfo.put("gamePlayer", gamePlayer.getGame().getGamePlayers()
                .stream()
                .map(gp -> gamePlayerDTO(gp))
                .collect(toList()));
        gameInfo.put("ships", gamePlayer.getShip()
                .stream()
                .map(ship -> shipDTO(ship))
                .collect(toList()));
        gameInfo.put("MySalvoes", gamePlayer.getSalvo()
                .stream()
                .map(salvo -> salvoDTO(salvo))
                .collect(toList()));
        if(opponent(gamePlayer) != null) {
            gameInfo.put("OpponentSalvoes", opponent(gamePlayer).getSalvo()
                    .stream()
                    .map(salvo -> salvoDTO(salvo))
                    .collect(toList()));
        }
        gameInfo.put("stateOfGame", makeGameState(gamePlayer));
        return gameInfo;
    }

    private GamePlayer opponent(GamePlayer gamePlayer) {
        return gamePlayer.getGame().getGamePlayers()
                .stream()
                .filter(gamePlayer1 -> !gamePlayer
                        .getId()
                        .equals(gamePlayer1.getId()))
                .findFirst()
                .orElse(null);

        //this will get the called gameplayer (between ()) sorted by games, then filter them (while calling each one gameplayer1)
        //for each gameplayer1, if the ID of the called gameplayer is not equal to the id of the gameplayer1
        //you return it, if you dont find it(EG: only one player) return null
    }

    private Map<String, Object> getHitsDTO(Salvo salvo) {
        Map<String, Object> makeHitsDTO = new HashMap<>();
        Set<Ship> oppShipLocs = opponent(salvo.getGamePlayer()).getShip();
        List<String> getOppShips = oppShipLocs.stream().flatMap(ship -> ship.getLocations().stream()).collect(toList());

        for (Salvo salvoe: salvo.getGamePlayer().getSalvo()) {
            for(String locs : salvoe.getLocations()) {
                if(getOppShips.contains(locs)) {
                    makeHitsDTO.put(locs, salvoe.getTurn());
                }
            }
        }
        return makeHitsDTO;
    }

    private Map<String, Object> sunkShip(GamePlayer gamePlayer) {
        Map<String, Object> isSunk = new HashMap<>();

        //length of each ship (how many cells they cover)
        int battleship = 4;
        int patrol = 2;
        int carrier = 5;
        int submarine = 3;
        int destroyer = 3;

        //get player salvos in order to identify the ship type that has been hit
        List<String> mySalvoes = gamePlayer
                .getSalvo()
                .stream()
                .flatMap(salvo -> salvo.getLocations().stream())
                .collect(toList());

        //get opponent's ships and check if they match with player salvos in that case the ship loses a "length"
        //and if the length reaches 0 then ship is sunk returns as true
        for(Ship ship : opponent(gamePlayer).getShip()) {
            for(String locs : ship.getLocations()) {
                //if(mySalvoes.contains(locs)) {
                switch (ship.getType()) {
                    case "Battleship":
                        if(mySalvoes.contains(locs)) {
                            battleship--;
                            if(battleship == 0) {
                                isSunk.put(ship.getType(), "Sunk");
                            }
                        } else {
                            isSunk.put(ship.getType(), "Functional");
                        }
                        break;
                    case "PatrolBoat":
                        if(mySalvoes.contains(locs)) {
                            patrol--;
                            if(patrol == 0) {
                                isSunk.put(ship.getType(), "Sunk");
                            }
                        } else {
                            isSunk.put(ship.getType(), "Functional");
                        }
                        break;
                    case "Carrier":
                        if(mySalvoes.contains(locs)) {
                            carrier--;
                            if(carrier == 0) {
                                isSunk.put(ship.getType(), "Sunk");
                            }
                        } else {
                            isSunk.put(ship.getType(), "Functional");
                        }
                        break;
                    case "Submarine":
                        if(mySalvoes.contains(locs)) {
                            submarine--;
                            if(submarine == 0) {
                                isSunk.put(ship.getType(), "Sunk");
                            }
                        } else {
                            isSunk.put(ship.getType(), "Functional");
                        }
                        break;
                    case "Destroyer":
                        if(mySalvoes.contains(locs)) {
                            destroyer--;
                            if(destroyer == 0) {
                                isSunk.put(ship.getType(), "Sunk");
                            }
                        } else {
                            isSunk.put(ship.getType(), "Functional");
                        }
                        break;
                }
                //}
            }
        }
        return isSunk;
    }

    private Map<String, String> makeGameState(GamePlayer gamePlayer) {
        Map<String, String> stateDTO = new HashMap<>();

        if(opponent(gamePlayer) == null || gamePlayer.getGame().getGamePlayers().size() == 1) {
            stateDTO.put("Status", "WAITING for opp");
            return stateDTO;
        }
        if(gamePlayer.getShip().size() == 0 || gamePlayer.getShip().size() < 5) {
            stateDTO.put("Status", "WAITING for ships");
            return stateDTO;
        }

        if(gamePlayer.getGame().getGamePlayers().size() == 2) {
            GamePlayer opp = opponent(gamePlayer);

            if(opp.getShip().size() == 0 || opp.getShip().size() < 5) {
                stateDTO.put("Status", "WAITING opp ships");
                return stateDTO;
            }
            //check if both sides finished firing
            if(opp.getSalvo().size() == gamePlayer.getSalvo().size()) {
                Boolean playerAllShipsSunk = allShipsSunk(gamePlayer);
                Boolean oppAllShipsSunk = allShipsSunk(opp);

                    //player's ships are sunk, opponent wins
                    if(playerAllShipsSunk == true && oppAllShipsSunk == false) {
                        stateDTO.put("Status", "LOST");
                        return stateDTO;
                    }

                    //opponent's ships are sunk, player wins
                    if(playerAllShipsSunk == false && oppAllShipsSunk == true) {
                        stateDTO.put("Status", "WON");
                        return stateDTO;
                    }

                    //both sides ships are sunk, game is tied
                    if(playerAllShipsSunk == true && oppAllShipsSunk == true) {
                        stateDTO.put("Status", "TIE");
                        return stateDTO;
                    }

                    //game continues if both sides still have functional ships
                    if(playerAllShipsSunk == false && oppAllShipsSunk == false) {
                        stateDTO.put("Status", "CONTINUE");
                        return stateDTO;
                    }
            }

            //check if either the player or the opponent is ahead in turns
            if(gamePlayer.getSalvo().size() > opp.getSalvo().size()) {
                stateDTO.put("Status", "WAITING");
                return stateDTO;
            }
            if(gamePlayer.getSalvo().size() < opp.getSalvo().size()) {
                stateDTO.put("Status", "CONTINUE");
                return stateDTO;
            }
        }
        return stateDTO;
    }
    //check if all ships are sunk
    private Boolean allShipsSunk(GamePlayer gamePlayer) {
        Set<Salvo> oppSalvos = new LinkedHashSet<>(opponent(gamePlayer).getSalvo());
        List<String> allOppSalvoLocs = oppSalvos.stream().flatMap(salvo -> salvo.getLocations().stream()).collect(toList());
        //boolean sunk = false;
        for(Ship ship : gamePlayer.getShip()) {
            List<String> hits = new ArrayList<>(allOppSalvoLocs); //all of the opponent salvo locs are pushed into a new array list
            hits.retainAll(ship.getLocations()); //if the salvos dont hit the ships they get removed from the hits list

            boolean sunk = hits.size() >= ship.getLocations().size(); //if hit salvos are the same amount as the ship locs than this is returned as true

            if(!sunk) {
                return false;
            }
        }
        return true;
    }

    private void applyScores(Map<String, String> gameState, GamePlayer gamePlayer, GamePlayer opponent, Game currentGame) {
        String gameStatus = gameState.get("Status");
        /*
        if(gamePlayer.getGame().getScores() != null) {
            return;
        }
        */
        switch(gameStatus) {
            case "WON":
                if(gamePlayer.getGame().getScores().size() == 0) {
                    Score playerWon = new Score(currentGame, gamePlayer.getPlayer(), 1.0);
                    Score oppLost = new Score(currentGame, opponent.getPlayer(), 0.0);
                    gamePlayer.getGame().addScore(playerWon);
                    gamePlayer.getPlayer().addScore(playerWon);
                    opponent.getGame().addScore(oppLost);
                    opponent.getPlayer().addScore(oppLost);
                    scoreRepository.save(playerWon);
                    scoreRepository.save(oppLost);
                }
                break;
            case "LOST":
                if(gamePlayer.getGame().getScores().size() == 0) {
                    Score userLost = new Score(currentGame, gamePlayer.getPlayer(), 0.0);
                    Score oppWon = new Score(currentGame, opponent.getPlayer(), 1.0);
                    gamePlayer.getGame().addScore(userLost);
                    gamePlayer.getPlayer().addScore(userLost);
                    opponent.getGame().addScore(oppWon);
                    opponent.getPlayer().addScore(oppWon);
                    scoreRepository.save(userLost);
                    scoreRepository.save(oppWon);
                }
                break;
            case "TIE":
                if(gamePlayer.getGame().getScores().size() == 0) {
                    Score userTied = new Score(currentGame, gamePlayer.getPlayer(), 0.5);
                    Score oppTied = new Score(currentGame, opponent.getPlayer(), 0.5);
                    gamePlayer.getGame().addScore(userTied);
                    gamePlayer.getPlayer().addScore(userTied);
                    opponent.getGame().addScore(oppTied);
                    opponent.getPlayer().addScore(oppTied);
                    scoreRepository.save(userTied);
                    scoreRepository.save(oppTied);
                }

                break;
            case "CONTINUE":
                System.out.println("CONTINUE");
                break;
            case "WAITING":
                System.out.println("WAITING");
                break;
        }
    }

    private Map<String, Object> salvoDTO(Salvo salvo) {
        Map<String, Object> makeSalvoDTO = new HashMap<>();
        makeSalvoDTO.put("turn", salvo.getTurn());
        makeSalvoDTO.put("locations", salvo.getLocations());
        makeSalvoDTO.put("hits", getHitsDTO(salvo));
        makeSalvoDTO.put("isSunk", sunkShip(salvo.getGamePlayer()));
        makeSalvoDTO.put("oppSunk", sunkShip(opponent(salvo.getGamePlayer())));

        return makeSalvoDTO;
    }

    private Map<String, Object> shipDTO(Ship ship) {
        Map<String, Object> makeShipDTO = new HashMap<>();
        makeShipDTO.put("type", ship.getType());
        makeShipDTO.put("locations", ship.getLocations());

        return makeShipDTO;
    }

    private Map<String, Object> checkInfo(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }
}