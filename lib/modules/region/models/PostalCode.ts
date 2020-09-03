import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
@Entity()
export class PostalCode extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("int", { name: "kd_pos" })
	public kd_pos: number;

	@UpdateDateColumn()
	public readonly updated_at!: Date;

	@UpdateDateColumn()
	public readonly created_at!: Date;

	@UpdateDateColumn()
	public readonly deleted_at!: Date;
}
