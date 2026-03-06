import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {}

  // Create new session on login
  async createSession(
    user_id: number,
    tenant_id: number,
    refreshToken: string,
    device_info?: string,
    ip_address?: string,
  ) {
    const hashed_refresh_token = await bcrypt.hash(refreshToken, 10);
    const session = this.sessionRepository.create({
      user_id,
      tenant_id,
      hashed_refresh_token,
      device_info: device_info ?? null,
      ip_address: ip_address ?? null,
    });
    return this.sessionRepository.save(session);
  }

  // Find all sessions for a user
  async findUserSessions(user_id: number) {
    return this.sessionRepository.find({
      where: { user_id, status: 1 },
    });
  }

  // Validate refresh token against all sessions
  async validateRefreshToken(user_id: number, refreshToken: string) {
    const sessions = await this.findUserSessions(user_id);
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.hashed_refresh_token,
      );
      if (isMatch) return session; // return matched session
    }
    return null;
  }

  // Logout from one device
  async removeSession(session_id: number) {
    await this.sessionRepository.delete({ session_id });
  }

  // Logout from ALL devices
  async removeAllSessions(user_id: number) {
    await this.sessionRepository.delete({ user_id });
  }
}
