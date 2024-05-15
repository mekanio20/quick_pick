class ResponseService {
    async Success (msg, detail) {
        return {
            status: 200,
            type: 'success',
            msg: msg,
            msg_key: 'ok',
            detail: detail
        }
    }
    async Created (msg, detail)  {
        return {
            status: 201,
            type: 'success',
            msg: msg,
            msg_key: 'created',
            detail: detail
        }
    }    
    async BadRequest (msg, detail) {
        return {
            status: 400,
            type: 'error',
            msg: msg,
            msg_key: 'bad request',
            detail: detail
        }
    }
    async Unauthorized (msg, detail) {
        return {
            status: 401,
            type: 'error',
            msg: msg,
            msg_key: 'unauthorized',
            detail: detail
        }
    }
    async Forbidden (msg, detail) {
        return {
            status: 403,
            type: 'error',
            msg: msg,
            msg_key: 'forbidden',
            detail: detail
        }
    }
    async NotFound (msg, detail) {
        return {
            status: 200,
            type: 'error',
            msg: msg,
            msg_key: 'not found',
            detail: detail
        }
    }
}
module.exports = new ResponseService()