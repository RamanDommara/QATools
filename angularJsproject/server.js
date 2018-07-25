// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var randomstring = require('just.randomstring');
    var Request = require("request");

    const request = require('request');
    const OAuth   = require('oauth-1.0a');
    const crypto  = require('crypto');
    var jp = require('jsonpath');
    var mysql = require('mysql');
    var xml = require("xml-parse");
    var xml2js = require('xml2js');

    // configuration =================
// define model =================
    var Todo = mongoose.model('Todo', {
        text : String
    });
    mongoose.connect('mongodb://127.0.0.1:27017/TestDB');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
// routes ======================================================================



var con;
var activationToken;
var userId;
var companyId;
var email;
 app.get('/api/createAccount', function(req,response) {

 var randomstring = require("randomstring");
email= ''+ randomstring.generate(15)+"@appdirect.com" +''

//Get orchad env data
				request.get('https://orchard.appdirect.tools/api/environments/od-fkd53hvq5',function (err, respose, body) {
							var jp = require('jsonpath');

							var info = JSON.parse(body);
							var dbName=jp.query(info, '$.meta.appdirect.mysql.username');
							var dbPwd=jp.query(info, '$.meta.appdirect.mysql.password');
							var hostname=jp.query(info, '$.meta.db.db_host');

							console.log("db name ----------------------> "+ dbName);
							console.log("db pass ----------------------> "+ dbPwd);
							console.log("db host ----------------------> "+ hostname);

				 con = mysql.createConnection({
					 host: '' + hostname + '',
					 user: ''+dbName+ '',
					 password:''+dbPwd+ '',
					 database: ''+dbName+ ''
					 });

				 con.connect(function(err) {
					 console.log(err);
				 });

						console.log("orchad env api statuc code: "+ respose.statusCode);

				 });


				//1. Create company
								//var randomstring = require("randomstring");
								var uniqueString= randomstring.generate(15)
						request.post('https://od-fkd53hvq5.od16.appdirectondemand.com/api/account/v1/companies',{
							 oauth: {
									consumer_key: 'appdirect-237',
									consumer_secret: 'VDJbN2pCuhdJCEwq'
										 },
				// all meta data should be included here for proper signing
							 body:
																																									 {"name": uniqueString,
																																										 "enabled": "false",
																																										 "contact": {
																																												"phoneNumber": "6503212121",
																																												"address": {
																																													 "state": "MA",
																																													 "street1": "50 GROVE ST.",
																																													 "city": "Somerville",
																																													 "zip": "02114",
																																													 "country": "US"
																																												}
																																										 },
																																										 "emailAddress": uniqueString+"@appdirect.com",
																																										 "permissions": []},

								json: true
							 }, function (err, respose, body) {

								console.log("Create company api status code : "+respose.statusCode);
								var info = JSON.parse(JSON.stringify(body));
								companyId = info.id;

								 var url = 'https://od-fkd53hvq5.od16.appdirectondemand.com/api/account/v1/companies/'+companyId+'/users';

									//email= ''+ randomstring.generate(15)+"@appdirect.com" +''
                  console.log(email)
								 //INNER CALL, Create user
								 request.post(url,{
												oauth: {
													 consumer_key: 'appdirect-237',
													 consumer_secret: 'VDJbN2pCuhdJCEwq'
															},
												 headers: { 'content-type': 'application/xml; charset=UTF-8' },

												 // all meta data should be included here for proper signing
												body:"<user><contact><phoneNumber>6503212121</phoneNumber><address><state>MA</state><street1>50 GROVE ST.</street1><city>Somerville</city><zip>02114</zip><country>US</country></address></contact><customAttributes/><deleted>false</deleted><email>"+email+"</email><firstName>Chris</firstName><language>en</language><lastName>Weiss</lastName><locale>en_US</locale><password>tester2015</password><roles><role>USER</role></roles></user>",


												 json: false
												}, function (err, respose, body) {
												if(respose.statusCode == 201){
													console.log("Create user response code : "+respose.statusCode)
													console.log("User created with the email" + email)
													var parser=new xml2js.Parser();

													parser.parseString(body, function (err, result) {
															console.log(err);
															userId=''+result['user']['id']+'';
															userId=''+userId+';'
															console.log("user id from response "+ userId);
													});

													con.connect(function(err) {
														 con.query("select activation_token from users where email_address='"+''+email+''+"';", function (err, rows, fields) {
													console.log("DB Error Reusults: " + err);
													activationToken = rows[0].activation_token;
													console.log("Successfully get the Activation Token from database, Token is: "+activationToken)



													// 3. Activate user

													request.put('https://od-fkd53hvq5.od16.appdirectondemand.com/api/account/v1/users/'+userId,{

																 oauth: {
																		consumer_key: 'appdirect-237',
																		consumer_secret: 'VDJbN2pCuhdJCEwq'
																			 },
																			 headers: { 'content-type': 'application/xml; charset=UTF-8' },
													// all meta data should be included here for proper signing
																 body:"<user><activationUrl>https://od-fkd53hvq5.od16.appdirectondemand.com/accountSetup/"+activationToken+"</activationUrl><contact><phoneNumber>6503212121</phoneNumber><address><state>MA</state><street1>50 GROVE ST.</street1><city>Somerville</city><zip>02114</zip><country>US</country></address></contact><customAttributes/><deleted>false</deleted><email>"+email+"</email><firstName>Olivia</firstName><id>"+userId+"</id><language>en</language><lastName>Reeves</lastName><locale>en_US</locale><password>tester2015</password><status>ACTIVE</status><memberships><membership><enabled>false</enabled><company><name>4E5EIEIWNN</name><enabled>false</enabled><contact><phoneNumber>6503212121</phoneNumber><address><state>MA</state><street1>50 GROVE ST.</street1><city>Somerville</city><zip>02114</zip><country>US</country></address></contact><uuid>"+companyId+"</uuid></company><roles><role>SYS_ADMIN</role></roles></membership></memberships><rssrAssociations/></user>",

																	json: false
																 }, function (err, respose, body) {
																 console.log('https://od-fkd53hvq5.od16.appdirectondemand.com/api/account/v1/users/'+userId);


																 console.log("User is activated")
																 console.log(respose.statusCode);

																 });





													 });
													 });
												}

				 })
				})

				 console.log(email);
				 response.json(email);

});

app.get('*', function(req, res) {
        res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
