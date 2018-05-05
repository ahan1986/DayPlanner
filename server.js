var express = require("express");
var bodyParser = require('body-parser');
var app = express();

//Set the port of the application
// process.env.PORT is used so that Heroku can set the port

var PORT = process.env.PORT || 8080;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set("view engine", 'handlebars');

var mysql = require('mysql');

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'planner_db'
});

conn.connect(function(err) {
    if (err) {
        console.err("error connecting: " + err.stack);
        return;
    } 
    console.log("connected as id " + conn.threadID);
});

// using handlebars to render the main index.html parge with the todos in it/
app.get('/', function(req, res) {
    conn.query('SELECT * FROM plans;', function(err, data) {
        if(err) {
            return res.status(500).end();
        }
        res.render('index', {plans: data});
    });
});

//Create a new todo
app.post('/todos', function(req, res) {
    conn.query('INSERT INTO plans (plan) VALUES (?)', [req.body.plan], function(err, result) {
        if(err) {
            return res.status(500).end();
        }

        //Send back the ID of the new todo
        res.jason({ id: result.insertId });
        console.log({id: result.insertId});
    });
});

//retrieve all the todos
// this portion allows the user to go to this API-like site and see the json files
app.get('/todos', function(req, res) {
    conn.query('SELECT * FROM plans;', function(err, data) {
        if(err) {
            res.status(500).end();
        }

        res.json(data);
    });
});

//update a todo
app.put('/todos/:id', function( req, res) {
    conn.query('UPDATE plans SET plan = ? WHERE id = ?', [req.body.plan], [req.params.id], function(err, result) {
        if (err) {
            return res.status(500).end();
        } else if (result.changedRows === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    });
});

// add a delete
app.delete('/todos/:id', function(req, res) {
    conn.query("DELETE FROM plans WHERE id = ?", [req.params.id], function(err, data) {
        if(err) {
            return res.status(500).end();
        } else if(data.changedRows === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    });
});

//Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
    //log (server-side) when our server has started
    console.log('Server listening on: http://localhost:' + PORT);
});