package com.example.backend.user;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    //email 조회 (로그인 가입 시 중복 체크)
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsById(Long id);

    //ID로 단건/다건 조회
    Optional<User> findById(Long id);
    List<User> findAllByIdIn(Collection<Long> ids);

    //생성 수정 삭제..
    User save(User user);
    void deleteById(Long id);

}
