package com.example.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("jpa") //spring.profiles.active=jpa 일 때 활성화
@RequiredArgsConstructor
@Primary
public class UserJpaRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpa;


    @Override
    public User save(User user) {
        return jpa.save(user);
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpa.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public boolean existsById(Long id) {
        return jpa.existsById(id);
    }


    @Override
    public List<User> findAllByIdIn(Collection<Long> ids) {
        return jpa.findAllById(ids);
    }

    @Override
    public void deleteById(Long id) {
        jpa.deleteById(id);
    }
}
