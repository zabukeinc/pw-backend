export class CustomResponse {
	public ErrorResponse(status_code: number, msg: string): object {
		const result = {
			error: {
				code: status_code,
				message: msg,
			},
		};
		return result;
	}
}
