# Boilerplate Express API
Empty node express REST API project with MySQL integration for when you need a quick base to build on.

## Getting Started
If you have rights to this repository, simply clone it to your local machine. Otherwise, fork the repository on Github and then clone it. Install npm dependencies once the project is on your machine.
```
$ git clone https://github.com/jjdii/boilerplate-express-api.git
$ cd boilerplate-express-api
$ npm install
```

### Environment Variables
You'll need to create a local **.env** file at the root directory (`boilerplate-express-api/`) to store your application's secrets.
```
$ touch .env
```

Create a `PORT` variable within your **.env** file.

**Example:**
```
PORT=3000
```

If connecting to a MySQL database, add your host url, username, password and database as `DB_HOST`, `DB_USER`, `DB_PASS` and `DB_NAME` respectively to your **.env** file.

**Example:**
```
DB_HOST=test.nc9isu74yyud.us-east-1.rds.amazonaws.com
DB_USER=root
DB_PASS=********
DB_NAME=test_db
```

## Running the API
Run the following command to initialize the API. The server will automatically restart when any changes are made to the code.
```
$ npm start
```

## Using the API
Import the Postman collection ([boilerplate-express-api/docs/pm.json](https://github.com/jjdii/boilerplate-express-api/blob/master/docs/pm.json)) into Postman to receive a set of test endpoints using the `resources` database table, if left unchanged. 

There's a matching SQL script ([boilerplate-express-api/docs/db.sql](https://github.com/jjdii/boilerplate-express-api/blob/master/docs/db.sql)) that can be used to create the `resources` table, if you wish to use it for testing.