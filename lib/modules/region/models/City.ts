import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
@Entity({ name: "tbl_kabkot" })
export class City extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	public id!: number;

	@Column("int", { name: "provinsi_id" })
	public provinsi_id: number;

	@Column("varchar", { name: "kabupaten_kota" })
	public kabupaten_kota: string;

	@Column("varchar", { name: "ibukota" })
	public ibukota: string;
}
