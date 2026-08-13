import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, QueryRunner } from 'typeorm';

export type ProvisionedStaffOwner = {
  id: string;
  email: string;
  plainPassword: string;
};

/** Password pattern: restaurant name (no spaces) + @123, e.g. HastyTasty@123 */
export function staffPasswordFromRestaurantName(restaurantName: string): string {
  const compact = restaurantName.trim().replace(/\s+/g, '');
  if (!compact) return 'Restaurant@123';
  const prefix = compact.charAt(0).toUpperCase() + compact.slice(1).toLowerCase();
  return `${prefix}@123`;
}

@Injectable()
export class StaffOwnerProvisioner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createForRestaurant(
    restaurantName: string,
    ownerEmail: string,
    queryRunner?: QueryRunner,
  ): Promise<ProvisionedStaffOwner> {
    const email = ownerEmail.trim().toLowerCase();
    const db = queryRunner ?? this.dataSource;

    const existing = (await db.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email],
    )) as { id: string }[];

    if (existing.length > 0) {
      throw new ConflictException('A user with this email already exists');
    }

    const id = randomUUID();
    const plainPassword = staffPasswordFromRestaurantName(restaurantName);
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    const name = `${restaurantName.trim()} Staff`;

    await db.query(
      `INSERT INTO users (id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, 'staff')`,
      [id, email, passwordHash, name],
    );

    return { id, email, plainPassword };
  }
}
