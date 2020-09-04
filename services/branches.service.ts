"use strict";
import { Context, Service, ServiceBroker } from "moleculer";
import DbConnection from "../mixins/sql.mixin";
import { Branch } from "../lib/modules/branch/models/Branch";
// import { error } from "../config/Error";

import { Responses } from "../lib/modules/utils/Responses";

import { BranchController } from "../lib/modules/branch/controllers/branch.controller";
export default class BranchesService extends Service {
	private DbMixin = new DbConnection("branch").start();
	private branchController: BranchController = new BranchController();
	private responses = new Responses();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "branches",
			mixins: [this.DbMixin],
			model: Branch,
			// TODO: implementasi settings for validator
			settings: {
				entityValidator: {
					id: { type: "number", optional: true },
				},
				fields: [
					"id",
					"branch_code",
					"branch_name",
					"address",
					"province",
					"postal_code",
					"country",
					"city",
					"is_active",
					"phone",
					"email",
					"web_addres",
					"updated_at",
					"created_at",
					"deleted_at",
				],
			},
			hooks: {
				after: {
					create: (context, res) => {
						console.info(res);
						res.created_at = new Date().toLocaleString("en-US", {
							timeZone: "Asia/Jakarta",
						});
						context.call("warehouses.create", {
							branch_id: res.id,
							warehouse_code: `${res.branch_code}-warehouse`,
							location_name: res.address,
							is_store: true,
						});
						return res;
					},
				},
			},
			actions: {
				auth: {
					rest: "/auth",
					params: {
						branch_code: "string",
					},
					async handler(
						ctx: Context<{ branch_code: string }>
					): Promise<string> {
						console.info(ctx.params.branch_code);
						return this.adapter.findOne({
							branch_code: ctx.params.branch_code,
						});
					},
				},
				callFoo: {
					rest: "GET /foo/",
					async handler(ctx) {
						return this.branchController.index(ctx);
					},
				},
				callFooById: {
					rest: "GET /foo/:id",
					async handler(ctx) {
						return this.branchController.show(ctx);
					},
				},

				createFoo: {
					rest: "POST /foo/",
					async handler(ctx) {
						this.validateEntity(ctx.params);
						return this.branchController.create(ctx);
					},
				},
				updateFoo: {
					rest: "PUT /foo/:id",
					async handler(ctx) {
						return this.branchController.update(ctx);
					},
				},
				deleteFoo: {
					rest: "DELETE /foo/:id",
					async handler(ctx) {
						return this.branchController.remove(ctx.params.id);
					},
				},
			},
		});
	}
}
