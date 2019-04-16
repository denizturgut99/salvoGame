package com.denizbattleship.Salvo;

import java.lang.Long;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER)
    private Set<Ship> ships = new HashSet<>();

    @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER)
    private Set<Salvo> salvoes = new HashSet<>();

    public GamePlayer() {}

    public Long getId() {
        return this.id;
    }

    public GamePlayer(Game game ,Player player) {
        this.game = game;
        this.player = player;
    }

    public void addShip(Ship ship) {
        ship.setGamePlayer(this);
        this.ships.add(ship);
    }

    public void addSalvo(Salvo salvo) {
        salvo.setGamePlayer(this);
        this.salvoes.add(salvo);
    }

    public Player getPlayer() {
        return this.player;
    }

    public Score getScore() {
        return this.getGame().getScores()
                .stream()
                .filter(score -> score.getGame().equals(this.getGame()))
                .findFirst()
                .orElse(null);
        //this loops over the game in gamePlayer and gets the score, after that the score is streamed and filtered,
        //the filter checks if the score in a game equals to the gamePlayer's game than it matches otherwise null is returned
    }

    public Game getGame() {
        return this.game;
    }

    public Set<Ship> getShip() {
        return this.ships;
    }

    public Set<Salvo> getSalvo() {
        return this.salvoes;
    }

    public void setSalvoes(Set<Salvo> salvo) {
        this.salvoes = salvo;
    }

    public void setShips(Set<Ship> ship) {
        this.ships = ship;
    }

    public void setUser(Player player) {
        this.player = player;
    }

    public void setGame(Game game) {
        this.game = game;
    }

}
