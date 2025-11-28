package com.example.backend.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name ="users",indexes = {
        @Index(name = "idx_users_email",columnList = "email",unique = true),
        @Index(name = "idx_users_created_at",columnList = "created_at")
}
)
@Getter
@Setter
@ToString
public class User {

    //식별자
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //로그인 email(고유), password(암호 해시)
    @Column(nullable = false, length = 120, unique = true)
    private String email;
    @Column(nullable = false,length = 200)
    private String passwordHash;

    //프로필
    @Column(nullable = false,length = 60)
    private String nickname;
    @Column(nullable = false, updatable = false ,name = "created_at")
    private LocalDateTime createAt;

    @Column(name = "profile_key",length = 512)
    private String profileKey;


    //엔티티 생성 시 createdAt 자동 세팅
    @PrePersist //JPA 전용 어노테이션
    public void onCreate(){
        System.out.println("createAt = " + createAt);
        if(createAt==null)createAt=LocalDateTime.now();
        System.out.println(" 시간" + LocalDateTime.now());
    }

    public User(String email, String passwordHash, String nickname) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
    }

    public User(String email, String passwordHash, String nickname, String profileKey) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.profileKey = profileKey;
    }

    //JPA 기본생성자.
    protected User(){

    }


}
