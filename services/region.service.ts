"use strict";
import { Context, Service, ServiceBroker } from "moleculer";

import DbConnection from "../mixins/sql.mixin";
import { Province } from "../lib/modules/region/models/Province";
import { City } from "../lib/modules/region/models/City";
import { District } from "../lib/modules/region/models/District";
import { error } from "../config/Error";
import { getRepository, createConnection, Connection } from "typeorm";

export default class RegionService extends Service {
	// private DbMixin = new DbConnection("region").start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "region",
			methods: {
				async getConnection() {
					const connection: Connection = await createConnection(
						"regionConnection"
					).then(async (connection) => {
						return connection;
					});
				},
			},
			actions: {
				/**
				 * List warehouses
				 *
				 * @actions
				 * @param {Number} limit - Pagination limit
				 * @param {Number} offset - Pagination offset
				 *
				 * @returns {Object} List of warehouses
				 */
				showProvince: {
					rest: "GET /provinsi",
					async handler(ctx) {
						const connection: Connection = await createConnection(
							"test"
						);
						const res = await connection
							.getRepository<Province>(Province)
							.find();
						connection.close();
						if (res) {
							return {
								status: "success",
								data: res,
								errors: [],
							};
						} else {
							ctx.meta.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
							};
						}
					},
				},
				showCity: {
					rest: "GET /kota/:id",
					async handler(ctx) {
						const id: number = ctx.params.id;
						const connection: Connection = await createConnection(
							"test"
						);
						const res = await connection
							.getRepository<City>(City)
							.createQueryBuilder("city")
							.where("provinsi_id =:id", { id })
							.getMany();
						connection.close();
						if (res) {
							return {
								status: "success",
								data: res,
								errors: [],
							};
						} else {
							ctx.meta.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
							};
						}
					},
				},
				showDistrict: {
					rest: "GET /kecamatan/:id",
					async handler(ctx) {
						const id: number = ctx.params.id;
						const connection: Connection = await createConnection(
							"test"
						);
						const res = await connection
							.getRepository<District>(District)
							.createQueryBuilder("district")
							.where("kabkot_id =:id", { id })
							.getMany();
						connection.close();
						if (res != null) {
							connection.close();
							return {
								status: "success",
								data: res,
								errors: [],
							};
						} else {
							ctx.meta.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
							};
						}
					},
				},
			},
		});
	}
}
