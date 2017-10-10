let config = {
    elastic: {
        connection: {
            host: "localhost:9200",
            log: "info",
            requestTimeout: 60000
        },
        index: 'agencies_with_city',
        doc_type: 'recruitment_agencies'
    },
    xlsx: {
        sheet: 'Agencies',
        filename: 'RecruimentAgencies.xlsx',
        exclude: []
    },
    query: {
        iterable: true,
        query: {
            "size": 0,
            "aggs": {
                "duplicateCount": {
                    "terms": {
                        "field": "href.keyword",
                        "size": 10000
                    },
                    "aggs": {
                        "duplicateDocuments": {
                            "top_hits": {
                                "size": 1
                            }
                        }
                    }
                }
            }
        }
    },
    iterable: {
        main: ["aggregations", "duplicateCount"],
        loop: "buckets",
        path: {
            main: ["duplicateDocuments", "hits"],
            loop: "hits",
            source: "_source"
        }
    }
};

export {config as config}