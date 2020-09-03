"use strict";

import { Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import {Sequelize} from "sequelize";
import {TypeOrmDbAdapter} from "moleculer-db-adapter-typeorm";

class Connection implements Partial<ServiceSchema>, ThisType<Service>{

	private readonly database: any;
	private schema: Partial<ServiceSchema> & ThisType<Service> = {
		mixins: [DbService],
		async started() {
			// Check the count of items in the DB. If it's empty,
			// Call the `seedDB` method of the service.
			if (this.seedDB) {
				const count = await this.adapter.count();
				if (count === 0) {
					this.logger.info(`The '${this.collection}' collection is empty. Seeding the collection...`);
					await this.seedDB();
					this.logger.info("Seeding is done. Number of records:", await this.adapter.count());
				}
			}
		},
	};

	public constructor(dbName: string) {
		this.database = new TypeOrmDbAdapter({
			database: dbName,
			type: "mysql",
			host: "localhost",
			port: 3306,
			username: "root",
			password: "",
		});
	}

	public start(){
		this.schema.adapter = this.database;

		return this.schema;
	}

}

export default Connection;
