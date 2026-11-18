import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The Product and Category entities have Macedonian translation columns
 * (name_mk, description_mk) and categories.description_mk is `text`, but no earlier
 * migration created them. A fresh database built from migrations would make every
 * product/category query fail. IF NOT EXISTS makes this safe on databases that
 * already have the columns (e.g. ones created with TYPEORM_SYNC=true).
 */
export class AddTranslationColumns1763500000000 implements MigrationInterface {
  name = 'AddTranslationColumns1763500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name_mk" character varying`);
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_mk" text`);
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_mk" character varying`);
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_mk" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "description_mk"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "name_mk"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "description_mk"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "name_mk"`);
  }
}
