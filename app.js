var express = require('express');
var request = require('request');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.cookieParser('secret'));
app.use(express.cookieSession());

var clientId = "";
var clientSecret = ""; 

app.get('/login', function(req, res) {
  // Get the authorization code 
  // http://YOUR_URL?code=THE_AUTHORIZATION_CODE
  var url = "https://podio.com/oauth/authorize";
  var redirect = "http://localhost:3000/authorize";
  var path = url + "?client_id=" + clientId + "&redirect_uri=" + redirect; 
  res.redirect(path);
});

app.get('/authorize', function(req, res) {
  
  //grant_type=authorization_code&client_id=YOUR_APP_ID&redirect_uri=YOUR_URL&client_secret=YOUR_APP_SECRET&code=THE_AUTHORIZATION_CODE
  var url = "https://podio.com/oauth/token";
  console.log('authorize ....');
  console.log(req.query.code);
  var code = req.query.code;
  var grantType = "authorization_code";
  var redirect = "http://localhost:3000";
  console.log('authorize: ' + redirect);
  
  request.post({
    url: url,
    form: {
      grant_type: grantType,
      client_id: clientId,
      redirect_uri: redirect,
      client_secret: clientSecret,
      code: code
      }
    }, function(error, response, body) {
          if (error) return console.log(error);
          console.log(body);
          var data = JSON.parse(body);
          console.log(data.access_token);
          req.session.access_token = data.access_token;
          res.redirect('http://localhost:3000');
    });

});  // authorize

app.get('/timesheets', function(req, res){

  var oauth = 'OAuth2 ' + req.session.access_token;
  console.log('OAuth2: ' + oauth);
  
  appId = 6487217;
  viewId = 6200536;  
  var url = 'https://api.podio.com/item/app/6487217/filter/6200536/'
    request.post({
      headers: {
        'authorization': oauth,
        'content-type':'application/json',
      },
      url: url,
      }, function(error, response, body) {
          if (error) return console.log(error);
          data = JSON.parse(body);
          console.log(data.item);
          res.send(data.items);     
      });
}); // timesheets/oauth 


app.post('/addTimesheet', function(req, res){
  console.log(req.body.timesheet.title);
  var oauth = 'OAuth2 ' + req.session.access_token;
  console.log('OAuth2: ' + oauth);
  var url = 'https://api.podio.com/item/app/6487217/'
  request.post({
    headers: {
      'authorization': oauth,
      'content-type':'application/json',
    },
    url: url,
    body: JSON.stringify({
      fields: {
        "title": req.body.timesheet.title,
        "time-spent": parseInt(req.body.timesheet.hours),
        "cost-per-hour": { "value": 57.50, "currency": "USD" },
        "details-of-work": req.body.timesheet.description
      }
      })
      }, function(error, response, body) {
          if (error) return console.log(error);
          console.log(body);
          data = JSON.parse(body);
          res.send(data.items);
              
      });
  
}); // addTimesheet


app.listen(3000);
