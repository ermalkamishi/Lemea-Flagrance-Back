import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the ipAddress column to the orders table for IP-based rate limiting.
 */
export class AddIpAddressToOrders1747000000000 implements MigrationInterface {
  name = 'AddIpAddressToOrders1747000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "ipAddress" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "ipAddress"
    `);
  }
}
