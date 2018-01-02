var express = require('express');
var app = express();
const req = require('request');
var http = require('http');
const parseString = require('xml2js').parseString;

app.get('/angular/:symbol', function (request, response) {
    console.log ("inside........");
    var url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" + request.params.symbol;
    req(url, function(err, res, body) {
        if (res.statusCode === 200) { 
            console.log("Body is : " + body);
            response.header("Access-Control-Allow-Origin","*");
            response.header("Access-Control-Allow-Headers","X-Requested-With");
            response.send(body);
        } else {
            console.log("Unable to get data from Alpha Vantage server.");
            console.log("Error status code: " + res.statusCode);
        }
    });
});

app.get('/price/:tickerSymbol', function (request, response) {
    //console.log ("inside........");
    var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&symbol=' + request.params.tickerSymbol + '&apikey=E1LSMHBXBT5IH1G5';
    req(url, function(err, res, body) {
        if (res.statusCode === 200) {
            response.header("Access-Control-Allow-Origin","*");
            response.header("Access-Control-Allow-Headers","X-Requested-With");
            // extracting properties of of last day session
            var close = 0;
            var open = 0;
            var low = 0;
            var high = 0;
            var volume = 0;
            var timestamp;
            json_data = JSON.parse(body);
            //console.log(body);
            
            // extracting properties of latest closed day session
            timestamp = json_data["Time Series (Daily)"];
            var timestampKeys = Object.keys(timestamp);
            //console.log("key 0 name: " + timestampKeys[0]);
            close = timestamp[timestampKeys[0]]["4. close"];
            open = timestamp[timestampKeys[0]]["1. open"];
            low = timestamp[timestampKeys[0]]["3. low"];
            high = timestamp[timestampKeys[0]]["2. high"];
            volume = timestamp[timestampKeys[0]]["5. volume"];
            
            // extracting properties of previous closed day session  
            var last_close = 0;
            last_close = timestamp[timestampKeys[1]]["4. close"];
            
            var image;
            var change = (close-last_close);
            if (change >= 0) {
                image = "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png";    
            } else {
                image = "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
            }
            
            // extracting data for price chart
            var dateArr = [];
            var priceArr = [];
            var volumeArr = [];
            var maxVolume = 0;
            //date_default_timezone_set("UTC");
            //ini_alter('date.timezone','America/Los_Angeles');
            var lastDate = timestampKeys[0];
            for(i = 0; i< timestampKeys.length; i++) {
                dateArr [i] = Date.parse(timestampKeys[i]);
                priceArr [i] = parseFloat(timestamp[timestampKeys[i]]["4. close"]);
                volumeArr [i] = parseFloat(timestamp[timestampKeys[i]]["5. volume"]);
                if (maxVolume < parseFloat(timestamp[timestampKeys[i]]["5. volume"])){
                    maxVolume = parseFloat(timestamp[timestampKeys[i]]["5. volume"]);
                }
            }
        
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0
            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            } 
            if(mm<10){
                mm='0'+mm;
            } 
            
            //console.log("close: " + close + "open: " + open + "low: " + low + "high: " + high + "volume: "  + volume + "timestamp: " +  timestamp + "last_close: "  + last_close + "image: " + image + "change: " + change + "dateArr: " + dateArr + "priceArr: " + priceArr + "volumeArr: "  + volumeArr);

            var priceDataObj= {"close": close, "open": open, "low": low, "high": high, "volume": volume, "timestamp": lastDate, "last_close": last_close, "image": image, "change": change, "dateArr": dateArr, "priceArr": priceArr, "volumeArr": volumeArr, "maxVolume": maxVolume, "dd": dd, "mm": mm, "yyyy": yyyy, "symbol": request.params.tickerSymbol};
            var jsonResponse = JSON.stringify(priceDataObj);
            //console.log("json response");
            //console.log(jsonResponse);
            response.send(jsonResponse);
        } else {
            console.log("Unable to get data from Alpha Vantage server.");
            console.log("Error status code: " + res.statusCode);
        }
    });
});

app.get('/price/:tickerSymbol/indicator/:indicator/apikey/:apikey', function (request, response) {
    //console.log ("inside........");
    var url = "https://www.alphavantage.co/query?function=" + request.params.indicator + "&symbol=" + request.params.tickerSymbol + "&interval=daily&time_period=10&series_type=close&apikey=" + request.params.apikey;
    req(url, function(err, res, body) {
        if (res.statusCode === 200) { 
            response.header("Access-Control-Allow-Origin","*");
            response.header("Access-Control-Allow-Headers","X-Requested-With");
            //console.log("body: " + body);
            jsObject = JSON.parse(body); //parsed the JSON file to JS object
            var responseObject = parseValues(jsObject, request.params.indicator, request.params.tickerSymbol);
            response.send(responseObject);
        } else {
            console.log("Unable to get data from Alpha Vantage server.");
            console.log("Error status code: " + res.statusCode);
        }
    });
});

app.get('/newsFeed/symbol/:tickerSymbol', function (request, response) {
    //console.log ("inside........");
    var url = 'http://seekingalpha.com/api/sa/combined/' + request.params.tickerSymbol + '.xml';
    req(url, function(err, res, body) {
        if (res.statusCode === 200) { 
            response.header("Access-Control-Allow-Origin","*");
            response.header("Access-Control-Allow-Headers","X-Requested-With");
            //console.log("body: " + body);
            var jsObject;
            parseString(body, (err, result) => {
                var keys = Object.keys(result);
                var itemsArr = result[keys[0]]["channel"][0]["item"];
                var titles = [];
                var links = [];
                var pubDates = [];
                var authorNames = [];
                var count = 0;
                for (var i = 0; i < itemsArr.length; i++) {
                    if (itemsArr [i]["link"].indexOf != -1) {   
                        titles[i] = itemsArr [i]["title"];
                        links[i] = itemsArr [i]["link"];
                        pubDate = itemsArr [i]["pubDate"].toString();
                        pubDates[i] = pubDate.substr(0,25);
                        authorNames [i] = itemsArr [i]["sa:author_name"][0];
                        console.log(authorNames [i]);
                    }
                    count ++;
                    if (count == 5) {
                        break;
                    }
                } 
                
                jsObject = {"titles": titles, "links": links, "pubDates": pubDates, "authorNames": authorNames};
                
                console.log(jsObject)
            }); //parsed the XML file to JS object
            response.send(jsObject);
        } else {
            console.log("Unable to get data from Alpha Vantage server.");
            console.log("Error status code: " + res.statusCode);
        }
    });
});

function parseValues(jsObject, indicator, tickerSymbol){
    //console.log("inside parseValues function");
    //console.log("jsObject: " + jsObject);
    //console.log("indicator: " + indicator);
    //console.log("tickerSymbol: " + tickerSymbol);
    
        //parse JS 
        var key = "Technical Analysis: " + indicator;
        var dates = Object.keys(jsObject[key]);
        //console.log ("aray: " + dates);
        var yAxis = [];
        var valuesArr = [];
        var values1 = [];
        var values2 = [];
        var values3 = [];
        var keys = [];
        for (j = 0; j < 132; j++) {
            valuesArr = Object.values(jsObject[key][dates[j]]);//returns array of values of the key dates[j]
            //console.log(valuesArr);
            if (valuesArr.length == 1) {
                yAxis [j]= parseFloat(valuesArr[0]);
            } else if (valuesArr.length == 2){
                values1[j] = parseFloat(valuesArr[0]);
                values2[j] = parseFloat(valuesArr[1]);
            } else if (valuesArr.length == 3) {
                values1[j] = parseFloat(valuesArr[0]);
                values2[j] = parseFloat(valuesArr[1]);
                values3[j] = parseFloat(valuesArr[2]);
            }
            
        }
        
        keys = Object.keys(jsObject[key][dates[0]]);
        
        var date = [];
        for (i = 0; i < 132; i++){
            date.push(Date.parse(dates[i]));
        }
        
        var text = jsObject["Meta Data"]["2: Indicator"];
        if (valuesArr.length == 1) {
            responseObj = {"date": date, "yAxis": yAxis, "text": text, "indicator":  indicator, "tickerSymbol": tickerSymbol};
            jsonResponse = JSON.stringify(responseObj);
            //console.log("jsonResponse: " + jsonResponse);
            return jsonResponse;
            //createChart(date, yAxis, text, indicator, tickerSymbol);
        } else if (valuesArr.length == 2){
            responseObj = {"date": date, "values1": values1, "values2": values2, "text": text, "indicator": indicator, "tickerSymbol": tickerSymbol, "keys": keys};
            jsonResponse = JSON.stringify(responseObj);
            //console.log("jsonResponse: " + jsonResponse);
            return jsonResponse;
            //createChartTwo(date, values1, values2, text, indicator, tickerSymbol, keys);
        } else if (valuesArr.length == 3) {
            responseObj = {"date": date, "values1": values1, "values2": values2, "values3": values3, "text": text, "indicator": indicator, "tickerSymbol": tickerSymbol, "keys": keys};
            jsonResponse = JSON.stringify(responseObj);
            //console.log("jsonResponse: " + jsonResponse);
            return jsonResponse;
        }
    }

app.set('port', process.env.PORT||8080);
app.listen(app.get('port'), function() {
   console.log("server started...."); 
});

