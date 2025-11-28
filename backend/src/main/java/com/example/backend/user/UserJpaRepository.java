package com.example.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

//어노테이션이 필요없음
//spring-boot-starter-data-jpa 의 자동설정이 @EnableJpaRepositories를 이미 켜주고, JpaRepository를 상속한 인터페이스들을 스캔해서 Bean으로 등록한다.
public interface UserJpaRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsById(Long id);
}
