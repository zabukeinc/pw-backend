import { Service, ServiceBroker } from "moleculer";
import { Sequelize } from "sequelize";
import { DbAdapterInterface } from "../interfaces/DbAdapterInterface";
class SequelizeAdapter<M> implements DbAdapterInterface {
	private broker: ServiceBroker;
	private service: Service;
	private model: M;

	private readonly db: Sequelize;

	public constructor(database: Sequelize) {
		this.db = database;
	}

	public init(broker: ServiceBroker, service: Service): void {
		this.broker = broker;
		this.service = service;
	}

	public connect(): Promise<void> {
		this.model = this.service.schema.model;
		return this.db.authenticate().then(() =>
			Promise.resolve().then(() => {
				this.service.logger.info(
					"Sequelize adapter has connected successfully."
				);
			})
		);
	}

	public disconnect(): Promise<void> {
		if (this.db) {
			return this.db.close();
		}
		return Promise.resolve();
	}
}
