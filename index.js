import {warn, error, info, debug} from './logger'
import ElasticClient from './elastic'
import {config} from "./config";

let a = new ElasticClient(config)
    .then((res, err) => {
        return res.getMapping(config.elastic.index, config.elastic.doc_type)
    }).then((res, err) => {
        return res.createExcel(config.xlsx.filename, config.xlsx.sheet)
    })
    .then((res, err) => {
        return res.setExcelColumns(res.properties, config.xlsx.exclude)
    })
    .then((res, err) => {
        return res.specificSearchFn(config.elastic.index, config.elastic.doc_type, config.query.query)
    })
    .then((res, err) => {
        if (config.query.iterable)
            return res.writeIterableRows(config.iterable)
        else
            return res.writeRows()
    })
    .then((res, err) => {
        res.writeFile(config.xlsx.filename)
    })
    .catch((err) => {
        error(err)
    });


