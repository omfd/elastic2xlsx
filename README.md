# elastic2xlsx
Configuration driven data downloading library for transferring elastic documents into XLSX format. 

## The XLSX format[Sheets and Columns] are completely configuration driven. 
This is a NodesJS application with Elastic and Xlsx plugins.  
Define the data fetching patterns in configuration files and let the package handle rest. 
Don't write repetitive code for it. 
Whether it is the Search results which are returned in the "hits.hits" object structure or 
Aggregation queries which are returned is a "aggregation"  object with variable depth and names. It handles them all. 
Further, it needs to be extended to handle multi-depth iterable objects i.e arrays of objects of variables depth in objects
