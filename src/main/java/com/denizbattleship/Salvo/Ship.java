package com.denizbattleship.Salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.ManyToMany;

@Entity
public class Ship {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private Long id;
    private String type;

    @ElementCollection //is used to create lists of embeddable objects. An embeddable object is data intended for use only in the object containing it.
    @Column(name="shipLocs")
    private List<String> locations = new ArrayList<>();


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    public GamePlayer getGamePlayer() {
        return this.gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public Long getId() {
        return id;
    }

    public Ship() {}

    public Ship(String type, List locations) {
        this.type = type;
        this.locations = locations;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

   public void setLocations(List<String> loc) {
        this.locations = loc;
   }

    public List getLocations() {
        return locations;
    }
}
