package com.example.backend.user;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantReadWriteLock;

//@Component
//@Repository
//@Profile("memory") //spring.profiles.active=memory 일때 활성
public class UserMemoryRepository implements UserRepository{


    private final Map<Long, User> byId = new ConcurrentHashMap<>();
    private final Map<String , Long> emailToId = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong(1);
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    private static String norm(String email) {return email.toLowerCase(Locale.ROOT).trim();}


    @Override
    public User save(User user) {
        lock.writeLock().lock();

        try {
            if(user.getId()==null)
            {
                //엔티티에 setId가 없다면, 생성자/빌더로 새 객체 생성하는 방식으로 바꿔도 된다.
                var fail = user.getClass().getDeclaredField("id");
                fail.setAccessible(true);
                fail.set(user, seq.getAndIncrement());
            }

            String key =norm(user.getEmail());

            Long existsId = emailToId.get(key);
            if(existsId != null && existsId.equals(user.getId()) == false)
            {
                throw new IllegalStateException("이미 사용 중인 이메일입니다: " + user.getEmail());
            }

            User prev = byId.get(user.getId());
            if(prev != null)
            {
                String prevEmail = norm(prev.getEmail());
                if(prevEmail.equals(key)==false) emailToId.remove(prevEmail);
            }
            byId.put(user.getId(),user );
            emailToId.put(key, user.getId());
            return user;

        }catch (ReflectiveOperationException e)
        {
            throw new RuntimeException(e);

        }finally {
            lock.writeLock().unlock();
        }
    }

    //Id로 유저 찾
    @Override
    public Optional<User> findById(Long id) {
        lock.readLock().lock();
        try{
            return Optional.ofNullable(byId.get(id));
        }
        finally {
            lock.readLock().unlock();
        }
    }



    @Override
    public Optional<User> findByEmail(String email) {

        lock.readLock().lock();
        try {
            Long id = emailToId.get(norm(email));
            return id == null ? Optional.empty() : Optional.ofNullable(byId.get(id));
        }finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        lock.readLock().lock();
        try {
            return emailToId.containsKey(norm(email));
        }finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public boolean existsById(Long id) {
        return false;
    }


    @Override
    public List<User> findAllByIdIn(Collection<Long> ids) {
        return List.of();
    }

    //
    @Override
    public void deleteById(Long id) {
        lock.writeLock().lock();
        try {
            User removed = byId.remove(id);
            if (removed != null) {
                emailToId.remove(norm(removed.getEmail()));
            }
        }finally {
            lock.writeLock().unlock();
        }
    }
}
