"use strict";
import { Context, Service, ServiceBroker } from "moleculer";
import DbConnection from "../mixins/sql.mixin";
import { Branch } from "../lib/modules/branch/models/Branch";
import { error } from "../config/Error";
export default class BranchesService extends Service {
	private DbMixin = new DbConnection("branch").start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "branches",
			mixins: [this.DbMixin],
			model: Branch,
			// TODO: implementasi settings for validator
			settings: {
				fields: [
					"branch_code",
					"branch_name",
					"address",
					"city",
					"province",
					"postal_code",
					"country",
					"phone",
					"email",
				],
				entityValidator: {
					branch_code: { type: "string" },
					address: { type: "string" },
					city: { type: "string" },
					province: { type: "string" },
					postal_code: { type: "number" },
					country: { type: "string" },
					phone: { type: "string" },
					email: { type: "string" },
				},
			},
			hooks: {
				after: {
					create: (context, res) => {
						console.info(res);
						context.call("warehouses.create", {
							branch_id: res.branches.id,
							warehouse_code: `${res.branches.branch_code}-warehouse`,
							location_name: res.branches.address,
						});
						return res;
					},
				},
			},
			methods: {
				async transformResult(ctx, entities, branche) {
					if (Array.isArray(entities)) {
						const branches = await this.Promise.all(
							entities.map((item) =>
								this.transformEntity(ctx, item, branche)
							)
						);
						return {
							branches,
						};
					} else {
						const branches = await this.transformEntity(
							ctx,
							entities,
							branche
						);
						return { branches };
					}
				},
				async transformEntity(ctx, entity, branche) {
					if (!entity) return null;

					return entity;
				},
			},
			actions: {
				auth: {
					rest: "/auth",
					params: {
						branchCode: "string",
					},
					async handler(
						ctx: Context<{ branchCode: string }>
					): Promise<string> {
						console.info(ctx.params.branchCode);
						return this.adapter.findOne({
							branchCode: ctx.params.branchCode,
						});
					},
				},
				/**
				 * List branch
				 *
				 * @actions
				 * @param {Number} limit - Pagination limit
				 * @param {Number} offset - Pagination offset
				 *
				 * @returns {Object} List of branch
				 */
				list: {
					rest: "GET /",
					async handler(ctx) {
						const limit = ctx.params.limit
							? Number(ctx.params.limit)
							: 20;
						const offset = ctx.params.offset
							? Number(ctx.params.offset)
							: 0;

						let params = {
							limit,
							offset,
							sort: ["-created_at"],
							query: {},
						};
						let countParams;

						countParams = Object.assign({}, params);
						// Remove pagination params
						if (countParams && countParams.limit)
							countParams.limit = null;
						if (countParams && countParams.offset)
							countParams.offset = null;

						const res = await this.Promise.all([
							// Get rows
							this.adapter.find(params),

							// Get count of all rows
							this.adapter.count(countParams),
						]);

						const docs = await this.transformDocuments(
							ctx,
							params,
							res[0]
						);
						const r = await this.transformResult(
							ctx,
							docs,
							ctx.meta
						);
						return r;
					},
				},
				/**
				 * Create a branch.
				 *
				 * @actions
				 * @param {Object} - Branch entity
				 *
				 * @returns {Object} Created entity
				 */
				create: {
					rest: "POST /",
					async handler(ctx) {
						let entity = ctx.params;
						await this.validateEntity(entity);

						// validate Branch Code
						if (entity.branch_code) {
							const found = await this.adapter.findOne({
								branch_code: entity.branch_code,
							});
							if (found)
								throw new error(
									"Branch code already exists!",
									409,
									entity.branch_code
								);
						}
						// Validate branch name
						if (entity.branch_name) {
							const found = await this.adapter.findOne({
								branch_name: entity.branch_name,
							});
							if (found)
								throw new error(
									"Branch name already exists!",
									409,
									entity.branch_code
								);
						}

						const doc = await this.adapter.insert(entity);
						const branch = await this.transformDocuments(
							ctx,
							{},
							doc
						);
						const r = await this.transformResult(
							ctx,
							branch,
							ctx.meta
						);
						await this.entityChanged("created", r, ctx);
						return r;
					},
				},

				/**
				 * Update a branch.
				 *
				 * @actions
				 * @param {String} id -  ID Branch
				 * @param {Object} article - Branch modified fields
				 *
				 * @returns {Object} Updated entity
				 */
				update: {
					rest: "PUT /:id",
					async handler(ctx) {
						let newData = ctx.params;
						const id: number = parseInt(ctx.params.id);
						newData.updated_at = new Date();

						if (id) {
							const found = await this.adapter.findOne({
								id: id,
							});
							if (!found) {
								return {
									error: {
										code: 203,
										message: "Item not found",
									},
								};
							} else {
								const update = {
									$set: newData,
								};
								// validate Branch Code
								if (newData.branch_code) {
									const found = await this.adapter.findOne({
										branch_code: newData.branch_code,
									});
									if (found)
										throw new error(
											"Branch code already exists!",
											409,
											newData.branch_code
										);
								}
								// Validate branch name
								if (newData.branch_name) {
									const found = await this.adapter.findOne({
										branch_name: newData.branch_name,
									});
									if (found)
										throw new error(
											"Branch name already exists!",
											409,
											newData.branch_code
										);
								}
								const doc = await this.adapter.updateById(
									id,
									update
								);
								const docs = await this.transformDocuments(
									ctx,
									id,
									doc
								);
								const r = await this.transformResult(
									ctx,
									docs,
									ctx.meta
								);
								this.entityChanged("updated", r, ctx);
								console.info(doc);
								console.info(docs);
								console.info(r);
								return { branches: newData };
							}
						} else {
							ctx.meta.$statusCode = 404;
							return {
								error: {
									code: 203,
									message: "Item not found",
								},
							};
						}
					},
				},
				/**
				 * Remove a branch by id branch
				 *
				 * @actions
				 * @param {String} id - branch id
				 *
				 * @returns {Object} Deleted brach id
				 */
				remove: {
					rest: "DELETE /:id",
					params: {
						id: { type: "any", positive: true, integer: true },
					},
					async handler(ctx) {
						const id: number = parseInt(ctx.params.id);
						if (id) {
							const found = await this.adapter.findOne({
								id: id,
							});
							if (!found) {
								ctx.meta.$statusCode = 404;
								return {
									error: {
										code: 203,
										message: "Item not found",
									},
								};
							} else {
								const doc = await this.adapter.removeById(id);
								const docs = await this.transformDocuments(
									ctx,
									id,
									doc
								);
								const r = await this.transformResult(
									ctx,
									docs,
									ctx.meta
								);
								this.entityChanged("removed", r, ctx);
								console.info(docs);
								return r;
							}
						} else {
							return {
								error: {
									code: 203,
									message: "Item not found",
								},
							};
						}
					},
				},
			},
		});
	}
}
