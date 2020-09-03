import { Service, ServiceBroker } from "moleculer";
import { Model, ModelStatic } from "sequelize";

export interface DbAdapterInterface {
	init(broker: ServiceBroker, service: Service): void;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
}

export interface DbMethod<M extends Model> {
	find(filters: any): any;
	findOne(options: object): Promise<M | null>;
	findById(param: number | string | Buffer): M;
	findByIds(ids: any[]): Promise<M | null>;
	count(filters: object): Promise<M | null>;
}
