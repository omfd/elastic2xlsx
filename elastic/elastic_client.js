import elasticsearch from "elasticsearch";
import {warn, error, info, debug} from '../logger'
import ExcelFile from '../xlsx'

/**
 * ElasticClient Class with connection client
 * and corresponding methods
 */
class ElasticClient {

    /**
     * Constructor Method
     * Elastic client initialization with the config
     * containing the ElasticSearch connection parameters
     * host:hosturl, log:loglevel
     * this.elasticClient = elasticClient reference
     * this.excel = exceljs Excel Object reference
     * @param config
     * @returns {*}
     */
    constructor(config) {
        return new Promise((resolve, reject) => {
            if (this.getClient()) {
                return ElasticClient.elasticClient;
                debug('elastic client already exists')
            }

            this.elasticClient = new elasticsearch.Client(config.elastic.connection);

            this.elasticClient.ping({
                // ping usually has a 3000ms timeout
                requestTimeout: 10000
            }, (error) => {
                if (error) {
                    debug('elasticsearch cluster is down!', error);
                    reject(error)
                } else {
                    debug('Elastic ping successfully');
                }
            });

            this.elasticClient.cluster.health({}, (err, resp, status) => {
                debug("Elastic health", resp);
                resolve(this)
            });
        })
        // return this.elasticClient;
    }

    /**
     * Get the ElasticClient Instance
     * @returns {elasticsearch.Client|*}
     */
    getClient() {
        debug('returned elastic client')
        return this.elasticClient
    };

    /**
     * Get the mapping of the Index and Doctype
     * return the properties of the mapping object
     * @param index - name of the index
     * @param type - doc type
     * @returns {Promise} - resolve with properties
     * or reject with err
     */
    getMapping(index, type) {
        return new Promise((resolve, reject) => {
            this.elasticClient.indices.getMapping({index, type}, (err, res, status) => {
                if (err)
                    reject(err);
                else {
                    info('mapping propertiees fetched');
                    this.properties = res[index].mappings[type].properties
                    resolve(this);
                }
            })
        })
    }

    /**
     * Create the Excel file for the date we are going to fetch
     * @param filename
     * @param sheet
     */
    createExcel(filename, sheet) {
        return new Promise((resolve, reject) => {
            new ExcelFile(filename, sheet).then((res, err) => {
                if (err)
                    reject(err)
                else {
                    this.excel = res
                    resolve(this)
                }
            })
        })
    }

    setExcelColumns(properties, exclude) {
        return new Promise((resolve, reject) => {
            try {
                let keys = Object.keys(properties)
                keys = this.excludeColumns(keys, exclude)
                let columns = keys.map((elem) => {
                    return {header: elem, key: elem}
                });
                error(columns)
                this.excel.worksheet.columns = columns
                resolve(this)
            } catch (err) {
                reject(err)
            }
        });
    }

    excludeColumns(columns, exclude = []) {
        let cols = columns.filter((elem, index) => {
            return !exclude.includes(elem)
        });
        return cols
    }


    specificSearchFn(index, type, body) {
        return new Promise((resolve, reject) => {
            this._privatePromisifiedSearchFn(index, type, body)
                .then((resp) => {
                    this.response = resp;
                    resolve(this);
                })
                .catch((err) => {
                    reject(err)
                });
        });
    };


    _privatePromisifiedSearchFn(index, type, body) {
        return new Promise((resolve, reject) => {
            try {
                this.elasticClient.search({index, type, body})
                    .then(function (resp) {
                        warn(resp)
                        resolve(resp);
                    }, function (err) {
                        reject(err)
                    });
            } catch (ex) {
                reject(ex);
            }
        });
    };

    writeRows() {
        return new Promise((resolve, reject) => {
            try {
                this.response.hits.hits.forEach((hit) => {
                    this.excel.worksheet.addRow(hit._source);
                });
                resolve(this)
            } catch (err) {
                reject(err)
            }
        })
    }

    writeIterableRows(iterable) {
        return new Promise((resolve, reject) => {
            try {
                let main = iterable.main
                let obj = this.response
                for (let value of main) {
                    obj = obj[value]
                }

                let loop = iterable.loop

                obj = obj[loop]

                obj.forEach((elem) => {
                    let row = elem
                    for (let value of iterable.path.main) {
                        row = row[value]
                    }
                    row = row[iterable.path.loop]
                    row.forEach((rowElem) => {
                        this.excel.worksheet.addRow(rowElem[iterable.path.source])
                    });
                });
                resolve(this)
            } catch (err) {
                reject(err)
            }
        })
    }

    writeFile(fileName) {
        this.excel.workbook.xlsx.writeFile(fileName)
            .then(function () {
                info('Filename: ' + fileName + ' written')
            })
            .catch((err) => {
                error(err)
            });
    }

}


export default ElasticClient