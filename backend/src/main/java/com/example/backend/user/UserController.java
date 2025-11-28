package com.example.backend.user;

import com.example.backend.user.dto.UserProfileDTO;
import com.example.backend.user.dto.UserRequest;
import com.example.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService svc;

    //create @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> create(@Valid @RequestPart("user") UserRequest req , @RequestPart(value = "file" ,required = false) MultipartFile profile)
    {
        return ResponseEntity.ok(svc.regist(req, profile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> get(@PathVariable Long id)
    {
        return ResponseEntity.ok(svc.getById(id));
    }


    // Read by email(예 ;/api/users??email=abc@x.com
    @GetMapping
    public ResponseEntity<UserResponse> getByEmail(@RequestParam(required = false) String email)
    {
        if(email==null || email.isBlank())
        {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(svc.getByEmail(email));
    }

    //delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id)
    {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }



}
