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
						await this.Promise.all(
							entities.map((item) =>
								this.transformEntity(ctx, item, company)
							)
						);
					} else {
						return await this.transformEntity(
							ctx,
							entities,
							company
						);
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
						return {
							status: "success",
							data: json,
							errors: [],
						};
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
					async handler(ctx) {
						let result = null;
						if (ctx.params.id) {
							const found = await this.adapter.findById(
								ctx.params.id
							);
							if (found) {
								const doc = await this.adapter.findById(
									ctx.params.id
								);
								const json = await this.transformDocuments(
									ctx,
									ctx.params.id,
									doc
								);
								result = {
									status: "success",
									data: json,
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
						}

						return result;
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
							if (found) {
								ctx.meta.$statusCode = 409;
								return {
									status: "failed",
									data: [],
									errors: "Company name already exists",
								};
							}
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

						return {
							status: "success",
							data: [r],
							errors: [],
						};
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
					rest: "PUT /",
					async handler(ctx) {
						const newData = ctx.params;
						const getId = await this.adapter.find();
						const resultId = await this.transformDocuments(
							ctx,
							{},
							getId
						);
						const id = resultId[0]._id;
						if (id) {
							const update = {
								$set: newData,
							};

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
							return {
								status: "success",
								data: [newData],
								errors: [],
							};
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
						const found = await this.adapter.findById(id);
						if (!found) {
							ctx.meta.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
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
							return {
								status: "success",
								data: [r],
								errors: [],
							};
						}
					},
				},
			},
		});
	}
}
