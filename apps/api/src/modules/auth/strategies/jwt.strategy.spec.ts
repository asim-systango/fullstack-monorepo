import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UserRepository } from '../../../database/repositories/user.repository';
import { UserStatus } from '../../../database/entities/user.entity';
import { JwtTokenType } from '../constants/auth.constants';

describe('JwtStrategy (apps/api)', () => {
    let strategy: JwtStrategy;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;

        strategy = new JwtStrategy(userRepository);
    });

    it('throws UnauthorizedException if token type is PASSWORD_RESET', async () => {
        const payload: JwtPayload = {
            sub: 'user-1',
            email: 'test@example.com',
            type: JwtTokenType.PASSWORD_RESET,
        };

        await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user is not found', async () => {
        userRepository.findById.mockResolvedValue(null as any);
        const payload: JwtPayload = { sub: 'user-1', email: 'test@example.com' };

        await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user status is INACTIVE', async () => {
        userRepository.findById.mockResolvedValue({
            id: 'user-1',
            status: UserStatus.INACTIVE,
        } as any);
        const payload: JwtPayload = { sub: 'user-1', email: 'test@example.com' };

        await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if isPasswordChangeRequired is true', async () => {
        userRepository.findById.mockResolvedValue({
            id: 'user-1',
            status: UserStatus.ACTIVE,
            isPasswordChangeRequired: true,
        } as any);
        const payload: JwtPayload = { sub: 'user-1', email: 'test@example.com' };

        await expect(strategy.validate(payload)).rejects.toThrow(ForbiddenException);
    });

    it('returns user if user is active and password change is not required', async () => {
        const mockUser = {
            id: 'user-1',
            status: UserStatus.ACTIVE,
            isPasswordChangeRequired: false,
        };
        userRepository.findById.mockResolvedValue(mockUser as any);
        const payload: JwtPayload = { sub: 'user-1', email: 'test@example.com' };

        const result = await strategy.validate(payload);
        expect(result).toEqual(mockUser);
    });
});
