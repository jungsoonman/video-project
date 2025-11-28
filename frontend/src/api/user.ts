import {http} from "./http";

import {UserData} from "../user/UserContext";


/*
* 유저 정보 가져오기 
**/

export async function searchUser(email: string): Promise<UserData> {
  const { data } = await http.get<UserData>("/users",{
    params: {email : email},
  });
  return data;  // ✅ UserData만 반환
}

