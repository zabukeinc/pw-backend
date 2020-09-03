import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
@Entity()
export class Branch extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("varchar", { length: 40, name: "branch_code" })
	public branch_code: string;

	@Column("varchar", { length: 255, name: "branch_name" })
	public branch_name: string;

	@Column("text", { nullable: true })
	public address: string;

	@Column("varchar", { nullable: true })
	public city: string;

	@Column("varchar", { nullable: true })
	public province: string;

	@Column("int", { nullable: true, name: "postal_code" })
	public postal_code: number;

	@Column("varchar", { nullable: true })
	public country: string;

	@Column("boolean", { nullable: true, name: "is_active" })
	public is_active: boolean;

	@Column("varchar", { nullable: true, length: 20 })
	public phone: string;

	@Column("varchar", { nullable: true, length: 90 })
	public email: string;

	@Column("varchar", { nullable: true, name: "web_address" })
	public web_address: string;

	@UpdateDateColumn()
	public readonly updated_at!: Date;

	@UpdateDateColumn()
	public readonly created_at!: Date;

	@UpdateDateColumn()
	public readonly deleted_at!: Date;
}
