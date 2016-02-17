[![Akera Logo](http://akera.io/logo.png)](http://akera.io/)

  REST File module for Akera.io web service - used mainly for developer studio this 
  broker middleware service provides access to files in application server web-path.
  
## Installation

```bash
$ npm install akera-rest-file
```

## Docs

  * [Website and Documentation](http://akera.io/)

## Quick Start

  This module is designed to only be loaded as broker level service which 
  is usually done by adding a reference to it in `services` section of 
  each broker's configuration in `akera-web.json` configuration file.
   
```json
  "brokers": [
  	{	"name": "demo",
  		"host": "localhost",
		"port": 3737,
		"services": [
			{ 
				"middleware": "akera-rest-file",
				"config": {
					"route": "/rest-file/"
				}
			}
		]
	}
  ]
```
  
  Service options available:
	- `route`: the route where the service is going to be mounted (default: '/rest/file/')
  
  The interface can then be used to access/update files on the application server's web-path by making 
  HTTP requests: 

| Method | Url | Function |
| --- | --- | --- |
| GET    | `http://[host]/[broker]/rest-file/path` | reads file or folder content of given path |
| PUT    | `http://[host]/[broker]/rest-file/path` | create a new file at given path, use `isDir` parameter with value or `true` to create a folder |
| POST   | `http://[host]/[broker]/rest-file/path` | update the file content at given path using the request body as new content |
| DELETE | `http://[host]/[broker]/rest-file/path` | delete the file or folder at given path |
 
## License
	
[MIT](https://github.com/akera-io/akera-rest-file/raw/master/LICENSE) 
