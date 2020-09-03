"use strict";
import { Context, Service, ServiceBroker } from "moleculer";
import { Branch } from "../models/Branch";
const _ = require("lodash");
const Promise = require("bluebird");

export class BranchController {
	private responses(status_code: number, message: string, data?: any) {
		return {
			code: status_code,
			message: message,
			data: data,
		};
	}

	public index(ctx: any) {
		// const limit = ctx.params.limit ? Number(ctx.params.limit) : 20;
		// const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;
		// let params = {
		// 	limit,
		// 	offset,
		// 	sort: ["-created_at"],
		// 	query: {},
		// };
		// let countParams;

		// countParams = Object.assign({}, params);
		// // Remove pagination params
		// if (countParams && countParams.limit) countParams.limit = null;
		// if (countParams && countParams.offset) countParams.offset = null;
		// const branches = ctx.call("branches.list");
		// return branches;
		ctx.call("branches.list").then((res: any) => {
			console.info(res);
		});
	}
	public create(ctx: Context) {
		const params = ctx.params;
		const branches = ctx.call("branches.create", params);
		if (branches) {
			return {
				branch: params,
			};
		} else {
			this.responses(500, "Failed to update data");
		}
	}

	public update(ctx: Context, id: number) {
		const newData = ctx.params;
		const branches = ctx.call("branches.get", { id: id });
		if (branches) {
			const update = ctx.call("branches.update", { id, newData });
			if (update) {
				return {
					branch: newData,
				};
			} else {
				this.responses(500, "Failed to update data");
			}
		} else {
			this.responses(203, "Item not found");
		}
	}
}
