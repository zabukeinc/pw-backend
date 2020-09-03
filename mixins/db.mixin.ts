"use strict";

import { existsSync } from "fs";
import { sync } from "mkdirp";
import { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";

class Connection implements Partial<ServiceSchema>, ThisType<Service> {
	private cacheCleanEventName: string;
	private collection: string;
	private schema: Partial<ServiceSchema> & ThisType<Service> = {
		mixins: [DbService],
		events: {
			/**
			 * Subscribe to the cache clean event. If it's triggered
			 * clean the cache entries for this service.
			 *
			 */
			async [this.cacheCleanEventName]() {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.*`);
				}
			},
		},
		methods: {
			/**
			 * Send a cache clearing event when an entity changed.
			 *
			 * @param {String} type
			 * @param {any} json
			 * @param {Context} ctx
			 */
			async entityChanged(type: string, json: any, ctx: Context) {
				await ctx.broadcast(this.cacheCleanEventName);
			},
		},
	};

	public constructor(public collectionName: string) {
		this.collection = collectionName;
		this.cacheCleanEventName = `cache.clean.${this.collection}`;
	}
	public start() {
		// Mongo adapter
		const MongoAdapter = require("moleculer-db-adapter-mongo");

		this.schema.adapter = new MongoAdapter(
			"mongodb://127.0.0.1:27017/local"
		);
		this.schema.collection = this.collection;

		return this.schema;
	}

	public get _collection(): string {
		return this.collection;
	}

	public set _collection(value: string) {
		this.collection = value;
	}
}
export default Connection;
