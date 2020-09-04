"use strict";
import { Context, Service, ServiceBroker } from "moleculer";

import DbConnection from "../mixins/sql.mixin";
import { Warehouse } from "../lib/modules/warehouse/models/Warehouse";
import { error } from "../config/Error";

export default class WarehouseService extends Service {
	private DbMixin = new DbConnection("warehouse").start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "warehouses",
			mixins: [this.DbMixin],
			model: Warehouse,
			settings: {
				entityValidator: {
					id: { type: "number", optional: true },
				},
			},
			methods: {
				async transformResult(ctx, entities, warehouse) {
					if (Array.isArray(entities)) {
						return await this.Promise.all(
							entities.map((item) =>
								this.transformEntity(ctx, item, warehouse)
							)
						);
					} else {
						return await this.transformEntity(
							ctx,
							entities,
							warehouse
						);
					}
				},
				async transformEntity(ctx, entity, warehouse) {
					if (!entity) return null;

					return entity;
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
						return {
							status: "success",
							data: r,
							errors: [],
						};
					},
				},
				/**
				 * Get a warehouse by ID
				 *
				 * @actions
				 * @param {Object} - Warehouse ID
				 *
				 * @returns {Object} Branch Entity
				 */
				get: {
					rest: "GET /:id",
					async handler(ctx) {
						let id: number = parseInt(ctx.params.id);
						const result = await this.adapter.findOne({ id });
						if (!result) {
							// status
							ctx.meta.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
							};
						} else {
							return {
								status: "success",
								data: [result],
								errors: [],
							};
						}
					},
				},
				/**
				 * Create a warehouse.
				 *
				 * @actions
				 * @param {Object} - warehouse entity
				 *
				 * @returns {Object} Created entity
				 */
				create: {
					rest: "POST /",
					async handler(ctx) {
						const entity = ctx.params;
						entity.created_at = new Date().toLocaleString("en-US", {
							timeZone: "Asia/Jakarta",
						});
						await this.validateEntity(entity);
						// validate warehouse code
						if (entity.warehouse_code) {
							const found = await this.adapter.findOne({
								warehouse_code: entity.warehouse_code,
							});
							if (found) {
								ctx.meta.$statusCode = 409;
								return {
									status: "failed",
									data: [],
									errors: "Warehouse code already exists",
								};
							}
						}

						const doc = await this.adapter.insert(entity);
						const warehouse = await this.transformDocuments(
							ctx,
							{},
							doc
						);
						const r = await this.transformResult(
							ctx,
							warehouse,
							ctx.meta
						);
						await this.entityChanged("created", r, ctx);
						ctx.meta.$statusCode = 201;
						return {
							status: "success",
							data: [r],
							errors: [],
						};
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
						newData.updated_at = new Date().toLocaleString(
							"en-US",
							{
								timeZone: "Asia/Jakarta",
							}
						);

						const found = await this.adapter.findOne({
							id: id,
						});
						if (!found) {
							ctx.params.$statusCode = 404;
							return {
								status: "failed",
								data: [],
								errors: "Data not found",
							};
						} else {
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
						ctx.params.deleted_at = new Date().toLocaleString(
							"en-US",
							{
								timeZone: "Asia/Jakarta",
							}
						);
						const id: number = parseInt(ctx.params.id);
						const found = await this.adapter.findOne({
							id: id,
						});
						if (!found) {
							ctx.params.$statusCode = 404;
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
								data: r,
								errors: [],
							};
						}
					},
				},
			},
		});
	}
}
