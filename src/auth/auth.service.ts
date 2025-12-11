import { Injectable } from "@nestjs/common";
import { HARD_USERS } from "../data/hardcoded-users";
import { LoginDto } from "./dtos/login.dto";
import { UserFactory } from "./factories/user.factory";

@Injectable()
export class AuthService {

  login(data: LoginDto) {
    const user = HARD_USERS.find(
      u => u.email === data.email && u.password === data.password
    );

    if (!user) {
      return { ok: false, message: "Credenciales incorrectas" };
    }

    const createdUser = UserFactory.createUser(user);

    return {
      ok: true,
      message: "Login exitoso",
      user: {
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
      }
    };
  }
}
