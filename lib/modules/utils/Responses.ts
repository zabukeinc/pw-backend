export class Responses {
	public json(status: string, data: any = [], errors: any = []): Object {
		return {
			status: status || "",
			data: data,
			errors: errors,
		};
	}
}
