const { MoleculerError } = require("moleculer").Errors;

export class error extends MoleculerError {
	constructor(msg: any, code: number, data: any) {
		super(msg, code);
	}
}
