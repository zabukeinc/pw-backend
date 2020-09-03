"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
	{
		company_name: { type: String },
		address: { type: String },
		province: { type: String },
		postal_code: { type: Number },
		country: { type: Boolean },
		logo_url: { type: String },
		phone: { type: Number },
		email: { type: String },
		site_address: { type: String },
	},
	{
		timestamps: true,
	}
);

// Add full-text search index
CompanySchema.index({
	//"$**": "text"
	title: "text",
	content: "text",
});

module.exports = mongoose.model("companies", CompanySchema);
