package com.denizbattleship.Salvo;

import org.aspectj.apache.bcel.util.Play;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import java.time.LocalDateTime;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;


@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository,GameRepository gameRepository, GamePlayerRepository gamePlayerRepository, ShipRepository shipRepository, SalvoRepository salvoRepository, ScoreRepository scoreRepository) {
		return(args) -> {

			LocalDateTime d1 = LocalDateTime.now();
			LocalDateTime d2 = d1.plusMinutes(30);
			LocalDateTime d3 = d1.plusMinutes(35);
			LocalDateTime d4 = d1.plusMinutes(40);


			Player p1 = new Player("j.bauer@ctu.org", passwordEncoder().encode("24"));
			Player p2 = new Player("c.obrian@ctu.org", passwordEncoder().encode("42"));
			Player p3 = new Player("kim_bauer@gmail.com", passwordEncoder().encode("22"));
			Player p4 = new Player("t.almeida@ctu.gov", passwordEncoder().encode("mole"));

			playerRepository.save(p1);
			playerRepository.save(p2);
			playerRepository.save(p3);
			playerRepository.save(p4);


			Game g1 = new Game(d1);
			Game g2 = new Game(d1);
			Game g3 = new Game(d2);
			Game g4 = new Game(d2);
			Game g5 = new Game(d3);
			Game g6 = new Game(d3);
			Game g7 = new Game(d4);
			Game g8 = new Game(d4);


			gameRepository.save(g1);
			gameRepository.save(g2);
			gameRepository.save(g3);
			gameRepository.save(g4);
			gameRepository.save(g5);
			gameRepository.save(g6);
			gameRepository.save(g7);
			gameRepository.save(g8);


			GamePlayer gp1 = new GamePlayer(g1, p1);
			GamePlayer gp2 = new GamePlayer(g1, p2);

			GamePlayer gp3 = new GamePlayer(g2, p1);
			GamePlayer gp4 = new GamePlayer(g2, p2);

			GamePlayer gp5 = new GamePlayer(g3, p2);
			GamePlayer gp6 = new GamePlayer(g3, p4);

			GamePlayer gp7 = new GamePlayer(g4, p2);
			GamePlayer gp8 = new GamePlayer(g4, p1);

			GamePlayer gp9 = new GamePlayer(g5, p4);
			GamePlayer gp10 = new GamePlayer(g5, p1);

			GamePlayer gp11 = new GamePlayer(g6, p3);

			GamePlayer gp12 = new GamePlayer(g7, p4);

			GamePlayer gp13 = new GamePlayer(g8, p3);
			GamePlayer gp14 = new GamePlayer(g8, p4);


			gamePlayerRepository.save(gp1);
			gamePlayerRepository.save(gp2);
			gamePlayerRepository.save(gp3);
			gamePlayerRepository.save(gp4);
			gamePlayerRepository.save(gp5);
			gamePlayerRepository.save(gp6);
			gamePlayerRepository.save(gp7);
			gamePlayerRepository.save(gp8);
			gamePlayerRepository.save(gp9);
			gamePlayerRepository.save(gp10);
			gamePlayerRepository.save(gp11);
			gamePlayerRepository.save(gp12);
			gamePlayerRepository.save(gp13);
			gamePlayerRepository.save(gp14);


			//ship locations

			List<String> loc1 = Arrays.asList("H2", "H3", "H4");
			List<String> loc2 = Arrays.asList("E1", "F1", "G1");
			List<String> loc3 = Arrays.asList("B4", "B5");
			List<String> loc4 = Arrays.asList("B5", "C5", "D5");
			List<String> loc5 = Arrays.asList("F1", "F2");
			List<String> loc6 = Arrays.asList("C6", "C7");
			List<String> loc7 = Arrays.asList("A2", "A3", "A4");
			List<String> loc8 = Arrays.asList("G6", "H6");

			//ship types and locations

			Ship sh1 = new Ship("Destroyer", loc1);
			gp1.addShip(sh1);
			Ship sh2 = new Ship("Submarine", loc2);
			gp1.addShip(sh2);
			Ship sh3 = new Ship("Patrol Boat", loc3);
			gp1.addShip(sh3);
			Ship sh30 = new Ship("Patrol Boat", loc8);
			gp1.addShip(sh30);
			Ship sh31 = new Ship("Submarine", loc7);
			gp1.addShip(sh31);

			Ship sh4 = new Ship("Destroyer", loc4);
			gp2.addShip(sh4);
			Ship sh5 = new Ship("Patrol Boat", loc5);
			gp2.addShip(sh5);

			Ship sh6 = new Ship("Destroyer", loc4);
			gp3.addShip(sh6);
			Ship sh7 = new Ship("Patrol Boat", loc6);
			gp3.addShip(sh7);

			Ship sh8 = new Ship("Submarine", loc7);
			gp4.addShip(sh8);
			Ship sh9 = new Ship("Patrol Boat", loc8);
			gp4.addShip(sh9);

			Ship sh10 = new Ship("Destroyer", loc4);
			gp5.addShip(sh10);
			Ship sh11 = new Ship("Patrol Boat", loc6);
			gp5.addShip(sh11);

			Ship sh12 = new Ship("Submarine", loc7);
			gp6.addShip(sh12);
			Ship sh13 = new Ship("Patrol Boat", loc8);
			gp6.addShip(sh13);

			Ship sh14 = new Ship("Destroyer", loc4);
			gp7.addShip(sh14);
			Ship sh15 = new Ship("Patrol Boat", loc6);
			gp7.addShip(sh15);

			Ship sh16 = new Ship("Submarine", loc7);
			gp8.addShip(sh16);
			Ship sh17 = new Ship("Patrol Boat", loc8);
			gp8.addShip(sh17);

			Ship sh18 = new Ship("Destroyer", loc4);
			gp9.addShip(sh18);
			Ship sh19 = new Ship("Patrol Boat", loc6);
			gp9.addShip(sh19);

			Ship sh20 = new Ship("Submarine", loc7);
			gp10.addShip(sh20);
			Ship sh21 = new Ship("Patrol Boat", loc8);
			gp10.addShip(sh21);

			Ship sh22 = new Ship("Destroyer", loc4);
			gp11.addShip(sh22);
			Ship sh23 = new Ship("Patrol Boat", loc6);
			gp11.addShip(sh23);

			Ship sh24 = new Ship("Patrol Boat", loc8);
			gp12.addShip(sh24);
			Ship sh25 = new Ship("Submarine", loc2);
			gp12.addShip(sh25);

			Ship sh26 = new Ship("Destroyer", loc7);
			gp13.addShip(sh26);
			Ship sh27 = new Ship("Patrol Boat", loc6);
			gp13.addShip(sh27);

			Ship sh28 = new Ship("Submarine", loc7);
			gp14.addShip(sh28);
			Ship sh29 = new Ship("Patrol Boat", loc8);
			gp14.addShip(sh29);


			shipRepository.save(sh1);
			shipRepository.save(sh2);
			shipRepository.save(sh3);
			shipRepository.save(sh4);
			shipRepository.save(sh5);
			shipRepository.save(sh6);
			shipRepository.save(sh7);
			shipRepository.save(sh8);
			shipRepository.save(sh9);
			shipRepository.save(sh10);
			shipRepository.save(sh11);
			shipRepository.save(sh12);
			shipRepository.save(sh13);
			shipRepository.save(sh14);
			shipRepository.save(sh15);
			shipRepository.save(sh16);
			shipRepository.save(sh17);
			shipRepository.save(sh18);
			shipRepository.save(sh19);
			shipRepository.save(sh20);
			shipRepository.save(sh21);
			shipRepository.save(sh22);
			shipRepository.save(sh23);
			shipRepository.save(sh24);
			shipRepository.save(sh25);
			shipRepository.save(sh26);
			shipRepository.save(sh27);
			shipRepository.save(sh28);
			shipRepository.save(sh29);
			shipRepository.save(sh30);
			shipRepository.save(sh31);

			//SALVO LOCATIONS
			List<String> salvoLoc1 = Arrays.asList("B5", "C5", "F1");
			List<String> salvoLoc2 = Arrays.asList("B4", "B5", "B6");

			List<String> salvoLoc3 = Arrays.asList("F2", "D5");
			List<String> salvoLoc4 = Arrays.asList("E1", "H3", "A2");

			List<String> salvoLoc5 = Arrays.asList("A2", "A4", "G6");
			List<String> salvoLoc6 = Arrays.asList("B5", "D5", "C7");

			List<String> salvoLoc7 = Arrays.asList("A3", "H6");
			List<String> salvoLoc8 = Arrays.asList("C5", "C6");

			List<String> salvoLoc9 = Arrays.asList("G6", "H6", "A4");
			List<String> salvoLoc10 = Arrays.asList("H1", "H2", "H3");

			List<String> salvoLoc11 = Arrays.asList("A2", "A3", "D8");
			List<String> salvoLoc12 = Arrays.asList("E1", "F2", "G3");

			List<String> salvoLoc13 = Arrays.asList("A3", "A4", "F7");
			List<String> salvoLoc14 = Arrays.asList("B5", "C6", "H1");

			List<String> salvoLoc15 = Arrays.asList("A2", "G6", "H6");
			List<String> salvoLoc16 = Arrays.asList("C5", "C7", "D5");

			List<String> salvoLoc17 = Arrays.asList("A1", "A2", "A3");
			List<String> salvoLoc18 = Arrays.asList("B5", "B6", "C7");

			List<String> salvoLoc19 = Arrays.asList("G6", "G7", "G8");
			List<String> salvoLoc20 = Arrays.asList("C6", "D6", "E6");
			List<String> salvoLoc21 = Arrays.asList("H1", "H8");

			//turns and salvo locations

			//game 1
			Salvo salvo1 = new Salvo(1, salvoLoc1);
			gp1.addSalvo(salvo1);
			Salvo salvo2 = new Salvo(1, salvoLoc2);
			gp2.addSalvo(salvo2);
			Salvo salvo3 = new Salvo(2, salvoLoc3);
			gp1.addSalvo(salvo3);
			Salvo salvo4 = new Salvo(2, salvoLoc4);
			gp2.addSalvo(salvo4);

			//game 2
			Salvo salvo5 = new Salvo(1, salvoLoc5);
			gp3.addSalvo(salvo5);
			Salvo salvo6 = new Salvo(1, salvoLoc6);
			gp4.addSalvo(salvo6);
			Salvo salvo7 = new Salvo(2, salvoLoc7);
			gp3.addSalvo(salvo7);
			Salvo salvo8 = new Salvo(2, salvoLoc8);
			gp4.addSalvo(salvo8);

			//game 3
			Salvo salvo9 = new Salvo(1, salvoLoc9);
			gp5.addSalvo(salvo9);
			Salvo salvo10 = new Salvo(1, salvoLoc10);
			gp6.addSalvo(salvo10);
			Salvo salvo11 = new Salvo(2, salvoLoc11);
			gp5.addSalvo(salvo11);
			Salvo salvo12 = new Salvo(2, salvoLoc12);
			gp6.addSalvo(salvo12);

			//game 4
			Salvo salvo13 = new Salvo(1, salvoLoc13);
			gp7.addSalvo(salvo13);
			Salvo salvo14 = new Salvo(1, salvoLoc14);
			gp8.addSalvo(salvo14);
			Salvo salvo15 = new Salvo(2, salvoLoc15);
			gp7.addSalvo(salvo15);
			Salvo salvo16 = new Salvo(2, salvoLoc16);
			gp8.addSalvo(salvo16);

			//game 5
			Salvo salvo17 = new Salvo(1, salvoLoc17);
			gp9.addSalvo(salvo17);
			Salvo salvo18 = new Salvo(1, salvoLoc18);
			gp10.addSalvo(salvo18);
			Salvo salvo19 = new Salvo(2, salvoLoc19);
			gp9.addSalvo(salvo19);
			Salvo salvo20 = new Salvo(2, salvoLoc20);
			gp10.addSalvo(salvo20);
			Salvo salvo21 = new Salvo(3, salvoLoc21);
			gp10.addSalvo(salvo21);

			salvoRepository.save(salvo1);
			salvoRepository.save(salvo2);
			salvoRepository.save(salvo3);
			salvoRepository.save(salvo4);
			salvoRepository.save(salvo5);
			salvoRepository.save(salvo6);
			salvoRepository.save(salvo7);
			salvoRepository.save(salvo8);
			salvoRepository.save(salvo9);
			salvoRepository.save(salvo10);
			salvoRepository.save(salvo11);
			salvoRepository.save(salvo12);
			salvoRepository.save(salvo13);
			salvoRepository.save(salvo14);
			salvoRepository.save(salvo15);
			salvoRepository.save(salvo16);
			salvoRepository.save(salvo17);
			salvoRepository.save(salvo18);
			salvoRepository.save(salvo19);
			salvoRepository.save(salvo20);
			salvoRepository.save(salvo21);


			Score sc1 = new Score(1.0);
			p1.addScore(sc1);
			g1.addScore(sc1);

			Score sc2 = new Score(0.0);
			p2.addScore(sc2);
			g1.addScore(sc2);


			Score sc3 = new Score(0.5);
			p1.addScore(sc3);
			g2.addScore(sc3);

			Score sc4 = new Score(0.5);
			p2.addScore(sc4);
			g2.addScore(sc4);


			Score sc5 = new Score(1.0);
			p2.addScore(sc5);
			g3.addScore(sc5);

			Score sc6 = new Score(0.0);
			p4.addScore(sc6);
			g3.addScore(sc6);


			Score sc7 = new Score(0.5);
			p2.addScore(sc7);
			g4.addScore(sc7);

			Score sc8 = new Score(0.5);
			p1.addScore(sc8);
			g4.addScore(sc8);


			Score sc9 = new Score(0.0);
			p4.addScore(sc9);
			g5.addScore(sc9);

			Score sc10 = new Score(1.0);
			p1.addScore(sc10);
			g5.addScore(sc10);


			Score sc11 = new Score(1.0);
			p3.addScore(sc11);
			g6.addScore(sc11);


			Score sc12 = new Score(0.0);
			p4.addScore(sc12);
			g7.addScore(sc12);


			Score sc13 = new Score(1.0);
			p3.addScore(sc13);
			g8.addScore(sc13);

			Score sc14 = new Score(0.0);
			p4.addScore(sc14);
			g8.addScore(sc14);


			scoreRepository.save(sc1);
			scoreRepository.save(sc2);
			scoreRepository.save(sc3);
			scoreRepository.save(sc4);
			scoreRepository.save(sc5);
			scoreRepository.save(sc6);
			scoreRepository.save(sc7);
			scoreRepository.save(sc8);
			scoreRepository.save(sc9);
			scoreRepository.save(sc10);
			scoreRepository.save(sc11);
			scoreRepository.save(sc12);
			scoreRepository.save(sc13);
			scoreRepository.save(sc14);
		};
	}
}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	PasswordEncoder passwordEncoder;

	@Autowired
	PlayerRepository playerRepository;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userName -> {
			Player player = playerRepository.findByUserName(userName);
			if(player != null) {
				return new User(player.getUserName(), player.getPassword(), AuthorityUtils.createAuthorityList("USER"));
			} else {
				throw new UsernameNotFoundException("Unknown user " + userName);
			}
		});
	}
}


@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers("/web/games.html").permitAll()
				.antMatchers("/web/game.html").hasAuthority("USER")
				.antMatchers("/web/games.js").permitAll()
				.antMatchers("/api/").permitAll()
				.and()
				.formLogin();

		http.formLogin()
				.usernameParameter("userName")
				.passwordParameter("password")
				.loginPage("/api/login");

		http.logout().logoutUrl("/api/logout");

		// turn off checking for CSRF tokens
		http.csrf().disable();

		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if login is successful, just clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
	}

	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}
}

