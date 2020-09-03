import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
	getConnection,
} from "typeorm";
@Entity({ name: "tbl_provinsi" })
export class Province extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("varchar", { length: 100, name: "provinsi" })
	public provinsi: string;

	@Column("varchar", { length: 100, name: "ibukota" })
	public ibukota: string;

	@Column("char", { length: 5 })
	public p_bsni: string;
}
