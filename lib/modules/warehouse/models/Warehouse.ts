import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
@Entity()
export class Warehouse extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("int", { nullable: true, name: "branch_id" })
	public branch_id: number;

	@Column("varchar", { length: 20, name: "warehouse_code" })
	public warehouse_code: string;

	@Column("varchar", { length: 40, name: "location_name" })
	public location_name: string;

	@Column("text", { nullable: true })
	public address: string;

	@Column("varchar", { nullable: true, length: 30 })
	public phone: string;

	@Column("boolean", { nullable: true })
	public status: boolean;

	@Column("boolean", { nullable: true, name: "is_store" })
	public is_store: boolean;

	@UpdateDateColumn()
	public readonly updated_at: Date;

	@UpdateDateColumn()
	public readonly created_at!: Date;

	@UpdateDateColumn()
	public readonly deleted_at!: Date;
}
