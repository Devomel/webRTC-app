class ApiError extends Error {
    status: number;
    errors: any[];

    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;

        this.name = 'ApiError';
    }

    static UnauthorizedError(): ApiError {
        return new ApiError(401, 'User has not been authorized');
    }

    static ForbiddenError(): ApiError{
        return new ApiError(401, 'User do not have permission to access this resource')
    }

    static BadRequest(message: string, errors: any[] = []): ApiError {
        return new ApiError(400, message, errors);
    }
}

export default ApiError;