package com.example.backend.user;

import com.example.backend.user.dto.UserRequest;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.video.MinioProps;
import com.example.backend.video.service.MinioService;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    //프로필 사진 저장.
    private final MinioService minio;


    private UserResponse toRes(User user)
    {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getPasswordHash(),
                user.getCreateAt(),
                user.getProfileKey()
        );
    }

    @Transactional
    public UserResponse regist(UserRequest request , MultipartFile file)
    {
        if (users.existsByEmail(request.email())) throw new IllegalStateException("이미 가입된 이메일 입니다.");
        String hash = encoder.encode(request.passwordHash());


        //프로필 .
        String key ="";

        if(file.isEmpty()) throw new IllegalArgumentException("empty profile");

        key = minio.upload(file , "profile");


        User saved = users.save(new User(request.email(),hash,request.name(),key));

        return toRes(saved);
    }

//    public User getByEmail(String email){
//        return users.findByEmail(email).orElseThrow(()->new IllegalStateException("존재하지 않는 이메일"));
//    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email)
    {
        User saved = users.findByEmail(email).orElseThrow(() -> new IllegalStateException("존재하지 않는 이메일"));
        return toRes(saved);
    }



//    public User getById(Long id){
//        return users.findById(id).orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자"));
//    }
    // 쓰기 트랜잭션.
    @Transactional(readOnly = true)
    public UserResponse getById(Long id)
    {
        User saved = users.findById(id).orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자"));
        return toRes(saved);
    }

    public void delete(Long id)
    {
        if(!users.existsById(id)){
            throw new IllegalStateException("사용자를 찾을 수 없습니다." + id);
        }
        users.deleteById(id);
        Optional<User> user = users.findById(id);
        minio.delete(user.get().getProfileKey(),"profile");

    }


}
