package com.denizbattleship.Salvo;

import org.hibernate.annotations.GenericGenerator;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.ManyToMany;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private Long id;

    private String userName;
    private String password;

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER)
    private Set<GamePlayer> gamePlayers = new HashSet<>();
    public Player(){}

    @OneToMany(mappedBy = "player", fetch = FetchType.EAGER)
    private Set<Score> scores = new HashSet<>();

    public Player(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getId() {
        return this.id;
    }

    public String getUserName() {
        return this.userName;
    }

    public void addGamePlayers(GamePlayer gamePlayer) {
        gamePlayer.setUser(this);
        gamePlayers.add(gamePlayer);
    }

    public void addScore(Score score) {
        score.setPlayer(this);
        scores.add(score);
    }

    public Set<Score> getScores() {
        return scores;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

}
