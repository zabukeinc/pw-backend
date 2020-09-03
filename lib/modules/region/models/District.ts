import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
@Entity({ name: "tbl_kecamatan" })
export class District extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("int", { name: "kabkot_id" })
	public kabkot_id: number;

	@Column("varchar", { length: 100, name: "kecamatan" })
	public kecamatan: string;
}
