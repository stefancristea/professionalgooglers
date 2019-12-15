const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const mysql = require('mysql');
var mysqlsessionstore = require('express-mysql-session')(session);
const app = express();

var db = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'smartcitizen'
});

var BACKEND_PORT = 8080;

var mysqlStore = new mysqlsessionstore({clearExpired: true, checkExpirationInterval: 900000, expiration: 86400000, createDatabaseTable: true}, db);

app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(session({key: 'mare_sukarime', secret: 'hackathon', store: mysqlStore, saveUninitialized: true, resave: false}));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(BACKEND_PORT, () => {
    console.log(`Web server running on port ${BACKEND_PORT}.`)
});

app.get('/getStats', function(requests, response) {
    
    let sendData = { totalParkingSpots: 0, totalParkingFreeSpots: 0, totalParkingLots: 0, totalUsers: 0};

    db.query('select COUNT(id) as total from users union select SUM(capacity) FROM parking_lots union SELECT COUNT(id) FROM parking_lots UNION SELECT expire_time FROM rentals WHERE expire_time > 1576332234645;', [Date.now()], function(error, results, fields) {
        if(error)
            return response.send({ type: 'error'});

        sendData.totalUsers = results[0].total;
        sendData.totalParkingSpots = results[1].total;
        sendData.totalParkingLots = results[2].total;
        sendData.totalParkingFreeSpots = results[1].total - (results.length - 3);
        
        response.send({ type: 'success', data: sendData});
    });
});

app.get('/getParkingLots', function(request, response) {
    db.query(`select * from parking_lots;`, function (error, results, fields) {                
        if(error)
            return response.send({ type: 'warning' });

        for(let i = 0; i < results.length; i++)
            results[i].emptySpots = results[i].capacity;

        db.query(`select * from rentals where expire_time > ?`, [Date.now()], function(_error, _results, _fields) {
            if(_error)
                return response.send({ type: 'warning' });

            for(let i = 0; i < _results.length; i++) {
                results[_results[i].parklot_id].emptySpots --;
            }

            response.send({ type: 'success', 'results': results });       
        }); 
    });
});

app.get('/getParkingLotInformation/:lotID', function(request, response) {

    if(request.params.lotID == undefined) 
        return response.send({ type: 'error'});
    
    db.query("select * from parking_lots where id = ?", [request.params.lotID], function(error, results, fields) {
        if(error)
            response.send({ type: 'error' });
        else {            
            db.query("select * from rentals where parklot_id = ? and expire_time > ?;", [request.params.lotID, Date.now()], function(err, res) {
                if(error)
                    return response.send({ type: 'error' });

                let info = results[0];
                info.Spots = [];

                for(i = 1; i <= info.capacity; i++)
                    info.Spots[i] = { occupied: false };

                res.forEach(rezultat => {
                    info.Spots[rezultat.park_spot] = { occupied: true, vehicle_number: rezultat.vehicle_number, expire_time: rezultat.expire_time};
                });

                response.send({ type: 'success', data: info});
            });
        }
    });
});

app.post('/registerUser', function(request, response) {

    if(request.session.isLoggedIn == true)
        response.send({ type: 'warning', message: 'You are already logged in!'});

    else if(request.body.userEmail == undefined)
        response.send({ type: 'warning', message: 'No username specified!' });
    
    else if(request.body.userPassword == undefined)
        response.send({ type: 'warning', message: 'No password specified!' });
        
    db.query('select id from users where email = ?', [request.body.userEmail], function(error, results, fields) {
        if(error) 
            response.send({type: 'warning', message: 'MySQL error!'});
        else if(results.length)
            response.send({ type: 'warning', message: 'Email already used!'});
        else {
            db.query('insert into users (email, password) VALUES (?, MD5(?));', [request.body.userEmail, request.body.userPassword], function(error) {
                if(error) 
                    response.send({type: 'warning', message: 'MySQL error!'});
                else 
                    response.send({type: 'success', message: 'Account registered!'});    
            });
        }
    });
});

app.post('/loginUser', function(request, response) {
    if(request.session.isLoggedIn == true)
        response.send({ type: 'warning', message: 'You are already logged in!'});

    else if(request.body.userEmail == undefined)
        response.send({ type: 'warning', message: 'No username specified!' });
    
    else if(request.body.userPassword == undefined)
        response.send({ type: 'warning', message: 'No password specified!' });

    db.query('select id from users where email = ? and password = MD5(?) LIMIT 1;', [request.body.userEmail, request.body.userPassword], function(error, results, fields) {
        if(error) 
            response.send({type: 'warning', message: 'MySQL error!'});
        else if(results.length == 0)
            response.send({ type: 'warning', message: 'Invalid credentials!'});
        else {
            response.send({ type: 'success', message: 'You are now logged in!', userID: results[0].id });    

            request.session.isLoggedIn = true;
            request.session.userID = results[0].id;
        }
    });    
});

app.post('/addRent', function(request, response) {    
    if(request.body.vehicleNumber == undefined || request.body.parkLot == undefined || request.body.parkSpot == undefined || request.body.Time == undefined || request.body.userID == undefined)
        return response.send({ status : 'error', message: 'Incomplete parameters.'});
        
    let timestampExpireTime = Date.now() + request.body.Time * 60000;

    db.query('insert into rentals (vehicle_number, parklot_id, park_spot, expire_time, user_id) VALUES (?, ?, ?, ?, ?);', [request.body.vehicleNumber, request.body.parkLot, request.body.parkSpot, timestampExpireTime, request.body.userID], function(error, results, fields) {
        if(error) {
            return response.send({status: 'error', message: 'MySQL error!'}); 
        }
        response.send({status: 'success', message: 'Park spot rented.'});
    });
});


app.post('/myParkings', function(request, response) {
    if(request.body.userID == undefined)
        return response.send({ status : 'error', message: 'Incomplete parameters.'});

    db.query('select rentals.*, parking_lots.name, parking_lots.latitude, parking_lots.longitude from rentals left join parking_lots on rentals.parklot_id = parking_lots.id where user_id = ? order by rentals.id DESC;', [request.body.userID], function (error, results) {
        if(error)
            return response.send({status : 'error', message: 'MySQL Error!'});
        response.send({status: 'success', parkings: results, serverTime: Date.now()});
    });
});

app.post('/deleteParking', function(request, response) {
    if(request.body.userID == undefined || request.body.spotID == undefined)
        return response.send({ status : 'error', message: 'Incomplete parameters.'});

    db.query('update rentals set `expire_time` = ? where `id` = ? and `user_id` = ?;', [Date.now(), request.body.spotID, request.body.userID], function(error, results, fields) {
        if(error)
            return reponse.send({status: 'error', message: 'MySQL error'});
        response.send({status: 'success', message: 'Parking updated!'});
    }); 
});

app.post('/extendRent', function(request, response) {    
    if(request.body.rentId == undefined || request.body.Time == undefined || request.body.userID == undefined)
        return response.send({ status : 'error', message: 'Incomplete parameters.'});
        
    let timestampExpireTime = request.body.Time * 60000;

    db.query('update rentals set expire_time = expire_time + ? where id = ? and user_id = ?;', [timestampExpireTime, request.body.rentId, request.body.userID], function(error, results, fields) {
        if(error) 
            return response.send({status: 'error', message: 'MySQL error!'}); 
        response.send({status: 'success', message: 'Park time extended.'});
    });
});