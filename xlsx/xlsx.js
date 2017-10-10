import {warn, error, info, debug} from '../logger'

let Excel = require('exceljs');

class ExcelFile {
    constructor(filename, sheet = 'My Sheet') {
        return new Promise((resolve, reject) => {
            try {
                this.workbook = new Excel.Workbook();
                this.workbook.creator = 'omfd';
                this.workbook.created = new Date();
                this.workbook.modified = new Date();
                this.worksheet = this.workbook.addWorksheet(sheet);
                info('Excel workbook created')
                resolve(this)
            } catch (err) {
                error(err)
                reject(err)
            }
        })
    }

    addColumns(columns, exclude = []) {
        error(columns)
        columns.filter((elem, index) => {
            !exclude.includes(elem)
        });

        this.worksheet.columns = columns
        // debug(this.worksheet.columns)
        return this
    }
}

export default ExcelFile