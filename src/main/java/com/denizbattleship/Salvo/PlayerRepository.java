package com.denizbattleship.Salvo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.repository.query.Param;

import java.util.List;

@RepositoryRestResource
public interface PlayerRepository extends JpaRepository<Player, Long> {
    //List<Player> findByUserName(String userName);
    Player findByUserName(@Param("userName") String userName);
   //Player findByID(@Param("id") Long id);
}

