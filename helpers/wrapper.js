const response = (res, type, result, message = '', code) => {
    let status = true;
    let data = result;
    if(type === 'fail'){
        status = false;
        data = '';
    }

    res.status(code).send({
        success: status,
        data,
        message,
        code
    });
};

const paginationResponse = (res, type, result, meta, message = '', code) => {
    let status = true;
    let data = result;
    if(type === 'fail'){
        status = false;
        data = '';
    }

    res.status(code).send({
        success: status,
        data,
        meta,
        message,
        code
    });
};

module.exports = {
    response,
    paginationResponse
}