package com.denizbattleship.Salvo;
import org.apache.tomcat.jni.Local;
import org.hibernate.annotations.GenericGenerator;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.*;
import java.time.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private Long id;

    private LocalDateTime gameDate;

    @OneToMany(mappedBy="game", fetch=FetchType.EAGER)
    private Set<GamePlayer> gamePlayers = new HashSet<>();

    @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
    private Set<Score> scores = new HashSet<>();

    public void addGameDate(GamePlayer gamePlayer) {
        gamePlayer.setGame(this);
        gamePlayers.add(gamePlayer);
    }

    public Game(){}

    public Game(LocalDateTime gameDate) {
        this.gameDate = gameDate;
    }

    public Long makeDate() {
        return System.currentTimeMillis();
    }

    public Long getId() {
        return this.id;
    }

    public LocalDateTime getDate() {
        return this.gameDate;
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void addScore(Score score) {
        score.setGame(this);
        scores.add(score);
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setDate(LocalDateTime gameDate) {
         this.gameDate = gameDate;
    }

}
