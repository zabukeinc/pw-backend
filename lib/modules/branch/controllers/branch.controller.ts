"use strict";
import { Context, Service, ServiceBroker } from "moleculer";
import { Branch } from "../models/Branch";
import { Responses } from "../../utils/Responses";
const _ = require("lodash");

export class BranchController {
	private responses = new Responses();
	public async index(ctx: any): Promise<any> {
		const data = await ctx.call("branches.find");
		if (data) {
			return this.responses.json("success", data);
		} else {
			ctx.meta.$statusCode = 500;
			return this.responses.json("failed", [], "Something went wrong");
		}
	}
	public async show(ctx: any): Promise<any> {
		const data = await ctx.call("branches.get", { id: ctx.params.id });
		if (data) {
			return this.responses.json("success", data);
		} else {
			ctx.meta.$statusCode = 404;
			return this.responses.json("failed", [], "Data not found");
		}
	}
	public async create(ctx: any): Promise<any> {
		ctx.params.created_at = new Date().toLocaleString("en-US", {
			timeZone: "Asia/Jakarta",
		});
		const data = await ctx.call("branches.create", ctx.params);
		if (data) {
			ctx.meta.$statusCode = 201;
			return this.responses.json("success", data);
		} else {
			ctx.meta.$statusCode = 500;
			return this.responses.json("failed", [], "Failed to create data");
		}
	}
	public async update(ctx: any): Promise<any> {
		// Gonna fix this soon
		const newData = {
			branch_code: ctx.params.branch_code,
			branch_name: ctx.params.branch_name,
			address: ctx.params.address,
			city: ctx.params.city,
			province: ctx.params.province,
			postal_code: ctx.params.postal_code,
			country: ctx.params.country,
			phone: ctx.params.phone,
			email: ctx.params.email,
			web_address: ctx.params.web_address,
		};
		const data = await ctx.call("branches.update", {
			id: ctx.params.id,
			branch_code: ctx.params.branch_code,
			branch_name: ctx.params.branch_name,
			address: ctx.params.address,
			city: ctx.params.city,
			province: ctx.params.province,
			postal_code: ctx.params.postal_code,
			country: ctx.params.country,
			phone: ctx.params.phone,
			email: ctx.params.email,
			web_address: ctx.params.web_address,
		});
		if (data) {
			return this.responses.json("success");
		} else {
			ctx.meta.$statusCode = 500;
			return this.responses.json("failed", [], "Something went wrong");
		}
	}

	public async remove(ctx: any) {
		const data = await ctx.call("branches.remove");
		if (data) {
			return this.responses.json("success", data);
		} else {
			ctx.meta.$statusCode = 500;
			return this.responses.json("failed", [], "Failed to update data");
		}
	}
}
