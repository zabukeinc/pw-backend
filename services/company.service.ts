"use strict";
import { Context, Service, ServiceBroker } from "moleculer";

import DbConnection from "../mixins/db.mixin";
const MongooseSchema = require("../lib/modules/company/models/Company");
import { error } from "../config/Error";

export default class ProductsService extends Service {
	private DbMixin = new DbConnection("companies").start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "company",
			mixins: [this.DbMixin],
			model: MongooseSchema,
			settings: {
				// Available fields in the responses
				fields: [
					"_id",
					"company_name",
					"address",
					"province",
					"postal_code",
					"country",
					"logo_url",
					"email",
					"site_address",
				],

				// Turn off validator for a while.

				// Validator for the `create` & `insert` actions.

				// entityValidator: {
				// 	name: "string|min:3",
				// 	price: "number|positive",
				// },
			},
			/**
			 * Loading sample data to the collection.
            async afterConnected() {
             await this.adapter.collection.createIndex({ name: 1 });
            },
			 */
			methods: {
				async transformResult(ctx, entities, company) {
					if (Array.isArray(entities)) {
						const companies = await this.Promise.all(
							entities.map((item) =>
								this.transformEntity(ctx, item, company)
							)
						);
						return {
							companies,
						};
					} else {
						const companies = await this.transformEntity(
							ctx,
							entities,
							company
						);
						return { companies };
					}
				},
				async transformEntity(ctx, entity, branche) {
					if (!entity) return null;

					return entity;
				},
			},
			actions: {
				/**
				 * List company
				 *
				 * @actions
				 *
				 * @returns {Object} List of company
				 */
				list: {
					rest: "GET /",
					async handler(ctx: Context<{}>) {
						const doc = await this.adapter.find();
						const json = await this.transformDocuments(
							ctx,
							{},
							doc
						);
						return json;
					},
				},
				/**
				 * List by ID Company
				 *
				 * @actions
				 *
				 * @returns {Object} List By ID Company
				 */
				get: {
					rest: "GET /:id",
					params: {
						id: { type: "string" },
					},
					async handler(ctx: Context<{ id: string }>) {
						let json = null;
						if (ctx.params.id) {
							const found = await this.adapter.findById(
								ctx.params.id
							);
							if (found) {
								const doc = await this.adapter.findById(
									ctx.params.id
								);
								json = await this.transformDocuments(
									ctx,
									ctx.params.id,
									doc
								);
							} else {
								return {
									error: {
										code: 203,
										message: "Item not found",
									},
								};
							}
						}

						return json;
					},
				},
				/**
				 * Create a company.
				 *
				 * @actions
				 * @param {Object} - company entity
				 *
				 * @returns {Object} Created entity
				 */
				create: {
					rest: "POST /",
					async handler(ctx) {
						let entity = ctx.params;
						await this.validateEntity(entity);

						if (ctx.params.company_name) {
							const found = await this.adapter.findOne({
								company_name: entity.company_name,
							});
							if (found)
								throw new error(
									"company already exists!",
									409,
									entity.company_name
								);
						}

						const doc = await this.adapter.insert(entity);
						const company = await this.transformDocuments(
							ctx,
							{},
							doc
						);

						const r = await this.transformResult(
							ctx,
							company,
							ctx.meta
						);

						await this.entityChanged("created", r, ctx);

						return r;
					},
				},
				/**
				 * Update a company.
				 *
				 * @actions
				 * @param {String} id -  ID company
				 * @param {Object} company - company modified fields
				 *
				 * @returns {Object} Updated entity
				 */
				update: {
					rest: "PUT /:id",
					async handler(ctx) {
						const newData = ctx.params;
						const id = ctx.params.id;

						if (id) {
							const found = await this.adapter.findById(id);
							if (!found) {
								return {
									error: {
										status: 203,
										message: "Item not found",
									},
								};
							} else {
								const update = {
									$set: newData,
								};

								// validate company name
								if (newData.company_name) {
									const found = await this.adapter.findOne({
										company_name: newData.company_name,
									});
									if (found)
										throw new error(
											"company name already exists!",
											409,
											newData.company_nme
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
								return { company: newData };
							}
						}
					},
				},
				/**
				 * Remove a branch by id company
				 *
				 * @actions
				 * @param {String} id - company id
				 *
				 * @returns {Object} Deleted company entity
				 */
				remove: {
					rest: "DELETE /:id",
					async handler(ctx) {
						const id: string = ctx.params.id;
						if (id) {
							const found = await this.adapter.findById(id);
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
