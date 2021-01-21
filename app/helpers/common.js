
module.exports = { getResponseJson };

async function getResponseJson(data, page) {
    const pageSize = 20;
    const recordsCount = data.length > 0 ? data.length : 0;
    const pageCount = Math.ceil(recordsCount / pageSize);    

    if (!page) { page = 1;}

    return body = {
        "page": page,
        "pageCount": pageCount,
        "recordsCount": recordsCount,
        "records" : data.length > 0 ? data.slice(page * 10 - 10, page * 10) : []
    };
}