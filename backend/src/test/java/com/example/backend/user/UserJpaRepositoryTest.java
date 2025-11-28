package com.example.backend.user;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

//@DataJpaTest
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserJpaRepositoryTest {

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Test
    @DisplayName("save & findByEmail")
    void save_and_findByEamil(){
        User user = new User("tnsaks55@naver.com", "pw", "soonman");
        userJpaRepository.save(user);

        Optional<User> found = userJpaRepository.findByEmail("tnsaks55@naver.com");
        Assertions.assertThat(found).isPresent();
        Assertions.assertThat(found.get().getNickname()).isEqualTo("soonman");
    }



}
