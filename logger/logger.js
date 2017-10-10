require('dotenv').config()
let info = require('debug')('elastic2xlsx:INFO'),
    warn = require('debug')('elastic2xlsx:WARN'),
    error = require('debug')('elastic2xlsx:ERROR'),
    debug = require('debug')('elastic2xlsx:DEBUG')

export {info, warn, error, debug}