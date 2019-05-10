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
                System.out.println(ship.getLocations());
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
            return new ResponseEntity<>("Name already used", HttpStatus.CONFLICT);
        }

        player.setPassword(passwordEncoder.encode(player.getPassword()));

        playerRepository.save(player);
        return new ResponseEntity<>("Named added", HttpStatus.CREATED);
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
        if(gamePlayer.getGame().getGamePlayers().size() > 1) {
            gameInfo.put("OpponentSalvoes", opponent(gamePlayer).getSalvo()
                    .stream()
                    .map(salvo -> salvoDTO(salvo))
                    .collect(toList()));
        }
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

        //this will get the called gameplayer (between ()) sorted by games, then filter them (while calling each one gamaplayer1)
        //for each gameplayer1, if the ID of the called gameplayer is not equal to the id of the gameplayer1
        //you return it, if you dont find it(EG: only one player) return null
    }

    private Map<String, Object> salvoDTO(Salvo salvo) {
        Map<String, Object> makeSalvoDTO = new HashMap<>();
        makeSalvoDTO.put("turn", salvo.getTurn());
        makeSalvoDTO.put("locations", salvo.getLocations());

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
