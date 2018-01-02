// code for autocomplete in ticker symbol text box
(function() {
        'use strict';
        angular
        .module('MyApp')
        .controller('DemoCtrl', DemoCtrl);

        function DemoCtrl($http, $scope) {
            this.querySearch = function (query) {
                return  $http.get('http://stocksearchusingalp-env.us-east-2.elasticbeanstalk.com/angular/' + escape(query))
                .then(function(result) {
        
                    return result.data;
                });
            }
            
            $scope.showFavData = function() {
                
                $("#favDetails").toggle("slide", {direction: "left"}, "slow");
                $("#quoteDetails").hide();
            }
            
            $scope.showStockDetails = function() {
                
                $("#quoteDetails").toggle("slide", {direction: "left"}, "slow");
                $("#favDetails").hide();
                
            }
        }
})();



$(document).ready(function(){  // a short method for document.ready event
    
    $('ul.nav-tabs li').click(function (e) {
       
       setTimeout(function(){
       if($('.active.checker .highcharts-container').length==0){
        $("#fbBtnDiv").prop('disabled',true);
       }       
       else{
           $("#fbBtnDiv").prop('disabled',false);
 
           }
       },500);
    }); 
  
    $("#clear").click (function(){
        debugger;
        $("#input-0").val("");
        /*$("#quoteDetails").hide();
        $("#favDetails").show(); */
        $("#slideRtBtn").attr("disabled", "disabled");
        $("#getQuoteBtn").prop('disabled',true);
        if (!$("#favDetails").is(":visible")){
         $("#favDetails").toggle("slide", {direction: "left"}, "slow");
         $("#quoteDetails").hide();
        } 
    });
    
     $("#input-0").focusout(function() {
         debugger;
        validateInput();
     });  
    
     $("#input-0").keyup(function() {
         debugger;
        validateInput();
     });  

    function validateInput() {
        if($("#input-0").val().trim() == "") {
            $("#getQuoteBtn").prop('disabled', true);
            $("#input-0").css("border","solid 1px red ");
            $("#userMssg").html("Please enter a stock ticker symbol.");
        }
        else {
            $("#getQuoteBtn").prop('disabled', false);
            $("#userMssg").html("");
            $("#input-0").css("border","");
        }
    }
    
    /*$("#slideLftBtn").click(function() {
        $("#quoteDetails").hide();
        $("#favDetails").show(); 
    });
    
    $("#slideRtBtn").click(function() {
        $("#quoteDetails").show();
        $("#favDetails").hide(); 
    });*/
    
    // function call to fill in fav table
    fillFavTable(); 
    
    $(document).on("click", ".symbolRowClass", function () {
        debugger;
            $("#slideRtBtn").removeAttr("disabled", false);
            var eleId = this.id;
            var tickerSymbol = eleId.split("-")[0];
            getQuote(tickerSymbol);
    });

    $("#getQuoteBtn").click(function(){
        debugger;
        /*$("#quoteDetails").show();
        $("#favDetails").hide();*/
        $("#slideRtBtn").removeAttr("disabled", false);
        var tickerSymbol = $("#input-0").val();
        getQuote(tickerSymbol);
        
        if (!$("#quoteDetails").is(":visible")){
         $("#quoteDetails").toggle("slide", {direction: "left"}, "slow");
         $("#favDetails").hide();
        } 
    });
    
   function getQuote(tickerSymbol){
       debugger;
       
       $('#favBtnDiv').attr("disabled", "disabled");
       $('#fbBtnDiv').attr("disabled", "disabled");
       
       var idArr = ["stockTableDiv", "Price", "SMA", "EMA", "CCI", "RSI", "ADX", "STOCH", "BBANDS", "MACD", "hisChartsDiv", "newsFeedDiv"];
       
       for (i = 0; i < idArr.length; i++) {
            document.getElementById(idArr[i]).innerHTML = "<div class='progress'><div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width:40%'></div></div>";
       }
       
       $("#quoteDetails").show();
       $("#favDetails").hide();
       
       // if all validations successful in step-1, then send data via Ajax call to server
       var apikey = 'E1LSMHBXBT5IH1G5';
       console.log("sending ajax call");
       $.ajax({
           url: 'http://stocksearchusingalp-env.us-east-2.elasticbeanstalk.com/price/' + tickerSymbol,
           type: 'GET',
           dataType: "json",
           success: function(response, status, xhr){
               //alert("response: " + response); 
               var close = response["close"];
               var change = response["close"]-response["last_close"];
               var changePercent = ((change/response["last_close"])*100).toFixed(2);
               var image = "";
               var colorClass = "";
               if (change > 0) {
                   colorClass = "green";
                   image = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
               } else {
                   colorClass = "red";
                   image = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
               }
               
               var time = response["timestamp"];
               var momentDate = moment.tz(time, "America/New_York");
               if (momentDate.tz("America/New_York").format("HH") == "00") {
                   momentDate.set({hour: "16"});
               }
               momentDate = momentDate.tz("America/New_York").format("YYYY-MM-DD HH:mm:ss z"); 
               
               // plotting the Stock Details table
               document.getElementById("stockTableDiv").innerHTML = "<table class='table table-striped'><tbody><tr><td>Stock Ticker Symbol</td><td>" + tickerSymbol + "</td></tr>" + "<tr><td>Last Price</td><td>" + parseFloat(close).toFixed(2).toLocaleString() + "</td></tr>" + "<tr><td>Change (Change Percent)</td><td class = '" + colorClass + "'>" + change.toFixed(2) + " (" + changePercent + ")&nbsp;<img height = 12px width = 12px src ='" + image + "'></td></tr>" + "<tr><td>Timestamp</td><td>" + momentDate + "</td></tr>" + "<tr><td>Open</td><td>" + response["open"] + "</td></tr>" + "<tr><td>Close</td><td>" + response["close"] + "</td></tr>" + "<tr><td>Day\'s Range</td><td>" + response["low"] + "-" + response["high"] + "</td></tr>" + "<tr><td>Volume</td><td>" + parseFloat(response["volume"]).toLocaleString() + "</td></tr></tbody></table>";
               
               $('#favBtnDiv').removeAttr("disabled", false);
               $('#fbBtnDiv').removeAttr("disabled", false);
               
               // creating data variables for making Favorites
               setFavData(tickerSymbol.toUpperCase(), response["close"], change.toFixed(2), changePercent, response["volume"]);
               
               // plotting Price chart
               var dateArrResp = response["dateArr"];
               var dateArrPrice = [];
               var volumeArrResp = response["volumeArr"];
               var volumeArrPrice = [];
               var priceArrResp = response["priceArr"];
               var priceArrPrice = [];
               var maxVolume = 0;
               debugger;
               for (i = 0; i < 132; i++) {
                   dateArrPrice [i] = dateArrResp[i];
                   volumeArrPrice [i] = volumeArrResp[i];
                   priceArrPrice [i] = priceArrResp[i];
                   if (maxVolume < volumeArrPrice [i]){
                        maxVolume = volumeArrPrice [i];
                   }
               }
               plotPriceChart(response["mm"], response["dd"], response["yyyy"], dateArrPrice, volumeArrPrice, priceArrPrice, maxVolume, response["symbol"]);
               
               var data = [];
               var dateArr = response["dateArr"];
               var priceArr = response["priceArr"];
               for (var i = 0; i < dateArr.length; i++) {
                   date = dateArr[i];
                   price = priceArr[i];
                   data [i] = [date, price];
               }
               
               createHighstockChart (tickerSymbol, data.reverse());
           }, 
           error: function (xhr, status, error) {
               console.log("error in ajax call for price data");
               document.getElementById("stockTableDiv").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get current stock data.</div>";
               document.getElementById("Price").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get Price data.</div>";
               document.getElementById("hisChartsDiv").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get historical charts data.</div>";
               
               // change star to hollow
               $("#favBtn").attr("class", "glyphicon glyphicon-star-empty");
               
               $('#favBtnDiv').attr("disabled", "disabled");
               
               
            
           }
   }); 
       getIndicatorData(tickerSymbol, apikey); 
       getNewsFeed(tickerSymbol);
}
    
    var favObj = {};
    
    function setFavData(tickerSymbol, price, change, changePercent, volume) {
        debugger;
        favObj = {"symbol": tickerSymbol, "price": price, "change": change, "changePercent": changePercent, "volume": volume};
        
        // set star to yellow/hollow- check if this symbol is already in local storage (ie. already in fav list)
        var containsKey = false;
        for (i = 0; i< localStorage.length; i++) {
            if (localStorage.key(i) === favObj["symbol"]) {
                containsKey = true;
            }
        }
        
        if (containsKey == true) {
            $("#favBtn").attr("class", "glyphicon glyphicon-star star");
        } else {
            // change star to hollow
            $("#favBtn").attr("class", "glyphicon glyphicon-star-empty");
        }  
    }
    
    function getIndicatorData(tickerSymbol, apikey){
        //get data for indicators by making an ajax calls to php code for every indicator
        var indicators = ["SMA", "EMA", "STOCH", "RSI", "ADX", "CCI", "BBANDS", "MACD"];
        
        for (var i = 0; i < 8; i++) {
            $.ajax({
            url: 'http://stocksearchusingalp-env.us-east-2.elasticbeanstalk.com/price/' + tickerSymbol + '/indicator/' + indicators[i] + '/apikey/' + apikey,
            dataType: "json",
            type: 'GET',
            success: function(response, status, xhr){
               // debugger;
                jsData = response;
                if (jsData["indicator"].toUpperCase() === "BBANDS" || jsData["indicator"].toUpperCase() === "MACD") {
                    createChartThree(jsData["date"], jsData["values1"], jsData["values2"], jsData["values3"], jsData["text"], jsData["indicator"], jsData["tickerSymbol"], jsData["keys"]);
                } else if (jsData["indicator"].toUpperCase() === "STOCH") {
                    createChartTwo(jsData["date"], jsData["values1"], jsData["values2"], jsData["text"], jsData["indicator"], jsData["tickerSymbol"], jsData["keys"]);
                } else {
                    createChart(jsData["date"], jsData["yAxis"], jsData["text"], jsData["indicator"], jsData["tickerSymbol"]);
                }
            },
            error: function (xhr, status, error) {
                console.log("error in ajax call for indicators");
                for (var i = 0; i < 8; i++) {
                    document.getElementById(indicators[i]).innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get " + indicators[i] + " data.</div>"; 
                }
                
                // change star to hollow
                $("#favBtn").attr("class", "glyphicon glyphicon-star-empty");
                
                $('#favBtnDiv').attr("disabled", "disabled"); 
            }
          });
        }
    } 
    
    function getNewsFeed (tickerSymbol) {
        $.ajax({
            url: 'http://stocksearchusingalp-env.us-east-2.elasticbeanstalk.com/newsFeed/symbol/' + tickerSymbol.toUpperCase(),
            type: 'GET',
            success: function(response, status, xhr){
                //debugger;
                console.log("Response received" + response);
                createNewsFeed (response["titles"], response["links"], response["pubDates"], response ["authorNames"]);
            },
            error: function (xhr, status, error) {
                console.log("error in ajax call for news feed");
                document.getElementById("newsFeedDiv").innerHTML = "<div class='alert alert-danger' role='alert'>Error! Failed to get news feed data.</div>";
            }
        });
    }
    
    function createNewsFeed (titles, links, pubDates, authorNames) {
        //debugger;
        var newsFeed = "";
        for (i = 0; i < titles.length; i++){
            var date = moment.tz(pubDates[i],"America/New_York");
            date = date.tz("America/New_York").format("ddd, DD MMM YYYY HH:mm:ss z");
            newsFeed += "<div class = 'well'><a target = '_blank' href = '" + links[i] + "'><h3>" + titles[i] + "</h3><br></a><p class = 'bold'>Author: " + authorNames[i] + "</p><p class = 'bold'>Date: " + date + "</p></div>";
        }
        document.getElementById("newsFeedDiv").innerHTML = newsFeed;
    }
    
    $("#favBtnDiv").click(function() {
        //debugger;
        if (typeof(Storage) !== "undefined") {
            
            if (!$("#favBtn").hasClass("star")) {
                while (jQuery.isEmptyObject(favObj)) {
                // to add stoppage in the code until fav data is loaded onto the web page
                }
                
                var colorClass = "";
                if (favObj["change"] > 0) {
                   colorClass = "green";
                   image = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
                } else {
                   colorClass = "red";
                   image = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
                }
                
                var favDataArr = [favObj["price"], favObj["change"] + " (" + favObj["changePercent"] + "%)", favObj["volume"]];
                
                // checking if the current symbol is already present in the local storage
                var containsKey = false;
                for (i = 0; i< localStorage.length; i++) {
                    if (localStorage.key(i) === favObj["symbol"]) {
                        containsKey = true;
                    }
                }
                
                if (containsKey == false) {
                    // add the data to localStorage
                    localStorage.setItem(favObj["symbol"], JSON.stringify(favDataArr));
                
                    // add the data to favorites list
                    var obj = JSON.parse(localStorage.getItem(favObj["symbol"]));
                    $("#favTableBody").append("<tr id = '" + favObj["symbol"] + "-FavRow" + "'><td id = '" + favObj["symbol"] + "-SymbolRow' class = 'symbolRowClass'>" + favObj["symbol"] + "</td><td>" + parseFloat(obj[0]).toFixed(2).toLocaleString() + "</td><td class = '" + colorClass + "'>" + obj[1] + "&nbsp;<img height = 12px width = 12px src ='" + image + "'></td><td>" + parseFloat(obj[2]).toLocaleString() + "</td><td><button id = '" + favObj["symbol"] + "-TrashBtn" + "' type='button' class='btn btn-default btn-sm trashBtn'><span class='glyphicon glyphicon-trash'></span></button></td></tr>");
                }
              
                // change star to yellow
                $("#favBtn").attr("class", "glyphicon glyphicon-star star");
            } else {
                
                // remove the data from localStorage
                localStorage.removeItem(favObj["symbol"]);
                
                // remove the data from favorites list
                $("#" + favObj["symbol"] + "-TrashBtn").parent().parent().remove();
                
                // change star to hollow
                $("#favBtn").attr("class", "glyphicon glyphicon-star-empty");
            }
        } else {
            // no Web Storage support
            console.log("no Web Storage support");
        }
  
    });
    
    // clicking trash can to delete the row fromlocal storage and fav table
    $(document).on("click", ".trashBtn", function () {
        var eleId = this.id;
        var rowId = eleId.split("-")[0];
        $(this).parent().parent().remove();
        
        // remove the data from localStorage
        localStorage.removeItem(rowId);
        
        if (favObj["symbol"].toUpperCase === rowId){
            // when the deleted entry is same as the currently displayed entry
    
            // change star to hollow
            $("#favBtn").attr("class", "glyphicon glyphicon-star-empty");
        }
        
    });
    
    // putting values into fav table from local storage, on opening web application 
    function fillFavTable () {
        //debugger;
        $("#favTableBody").empty();
        if (typeof(Storage) !== "undefined") {
            for (i = 0; i < localStorage.length; i++) {
                var obj = JSON.parse (localStorage.getItem(localStorage.key(i)));
                
                var changeStr = obj[1];
                var colorClass = "";
                var image;
                if (changeStr.charAt(0) == '-') {
                    colorClass = "red";
                    image = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
                } else {
                    colorClass = "green";
                    image = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
                }
                
                $("#favTableBody").append("<tr id = '" + localStorage.key(i) + "-FavRow" + "'><td id = '" + localStorage.key(i) + "-SymbolRow' class = 'symbolRowClass'>" + localStorage.key(i) + "</td><td>" + parseFloat(obj[0]).toFixed(2).toLocaleString() + "</td><td class = '" + colorClass + "'>" + obj[1] + "&nbsp;<img height = 12px width = 12px src ='" + image + "'></td><td>" + parseFloat(obj[2]).toLocaleString() + "</td><td><button id = '" + localStorage.key(i) + "-TrashBtn" + "' type='button' class='btn btn-default btn-sm trashBtn'><span class='glyphicon glyphicon-trash'></span></button></td></tr>");
            }
        }
    } 

    function plotPriceChart(mm, dd, yyyy, dateArr, volumeArr, priceArr, maxVolume, tickerSymbol) {
        debugger;
        $("#Price").empty();
        Highcharts.chart('Price', {
            
        tooltip:{xDateFormat:'%m/%d'},
            
        chart: {
            zoomType: 'x'
        },
        title: {
            text: "Stock Price " + mm + "/" + dd + "/" + yyyy
        },
        subtitle: {
            useHTML: true,
            text: '<a style = "text-decoration: none; color: blue" href="https://www.alphavantage.co/" target = "_blank">Source: Alpha Vantage</a>'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: "{value:%m/%d}"
            },
            tickInterval: 5,
            reversed: true,
            categories: dateArr,
           
        },
        yAxis: [{
            title: {
                text: 'Stock Price'
            }
        }, {
            title: {
                text: 'Volume',
                
            },
            gridLineWidth: 0,
            max: 5*parseInt(maxVolume),
            opposite: true
        }],
        plotOptions: {
            area: {
                marker: {
                    radius: 0
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'Price',
            data: priceArr,
            color: '#0000FF',
            fillOpacity: "0.3"
        },
            {
                type: 'column',
                name: tickerSymbol + ' Volume',
                data: volumeArr,
                yAxis: 1,
                color: 'red'
            }
            
        ]
    });
    
    }
    
    function createHighstockChart (tickerSymbol, data) {
        // Create the chart
        var chart = Highcharts.stockChart('hisChartsDiv', {

            chart: {
                height: 400
            },

            title: {
                text: tickerSymbol.toUpperCase() + ' Stock Value'
            },

            subtitle: {
                useHTML: true,
                text: '<a style = "text-decoration: none; color: blue" href="https://www.alphavantage.co/" target = "_blank">Source: Alpha Vantage</a>'
            },

            yAxis: {
            title: {
               text: 'Stock Value'
            }
            },
            rangeSelector: {
                selected: 1
            },
            tooltip: {split: false},
            series: [{
                name: 'Stock Price',
                data: data,
                type: 'area',
                threshold: null,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });


        $('#small').click(function () {
            chart.setSize(400);
        });

        $('#large').click(function () {
            chart.setSize(800);
        });

        $('#auto').click(function () {
            chart.setSize(null);
        });
    }
    
    function createChart(date, yAxis, text, indicator, tickerSymbol) {
        $("#" + indicator.toUpperCase()).empty();
        Highcharts.chart(indicator.toUpperCase(), {
            
        tooltip:{xDateFormat:'%m/%d'},
            
        chart: {
            zoomType: 'x'
        },
        title: {
            text: text
        },
        subtitle: {
            useHTML: true,
            text: '<a style = "text-decoration: none; color: blue" href="https://www.alphavantage.co/" target = "_blank">Source: Alpha Vantage</a>'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: "{value:%m/%d}"
            },
            tickInterval: 5,
            reversed: true,
            categories: date
        },
        yAxis: {
            title: {
                text: indicator
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: true,
                    radius: 2
                },
                lineWidth: 1,
            }
        },

        series: [{
            type: 'spline',
            name: tickerSymbol,
            data: yAxis
        }]
    });
    }
        
    function createChartTwo(date, values1, values2, text, indicator, tickerSymbol, keys) {
        $("#" + indicator.toUpperCase()).empty();
        Highcharts.chart( indicator.toUpperCase(), {
            
        tooltip:{xDateFormat:'%m/%d'},
            
        chart: {
            zoomType: 'x'
        },
        title: {
            text: text
        },
        subtitle: {
            useHTML: true,
            text: '<a style = "text-decoration: none; color: blue" href="https://www.alphavantage.co/" target = "_blank">Source: Alpha Vantage</a>'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: "{value:%m/%d}"
            },
            tickInterval: 5,
            reversed: true,
            categories: date
        },
        yAxis: {
            title: {
                text: indicator,
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: true,
                    radius: 2
                },
                lineWidth: 1,
            }
        },

        series: [{
            type: 'spline',
            name: tickerSymbol + " " + keys[0],
            data: values1
        }, 
        {
            type: 'spline',
            name: tickerSymbol + " " + keys[1],
            data: values2
        }
        ]
    });
    }
        
    function createChartThree(date, values1, values2, values3, text, indicator, tickerSymbol, keys) {
        $("#" + indicator.toUpperCase()).empty();
        Highcharts.chart(indicator.toUpperCase(), {
            
        tooltip:{xDateFormat:'%m/%d'},    
            
        chart: {
            zoomType: 'x'
        },
        title: {
            text: text
        },
        subtitle: {
            useHTML: true,
            text: '<a style = "text-decoration: none; color: blue" href="https://www.alphavantage.co/" target = "_blank">Source: Alpha Vantage</a>'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: "{value:%m/%d}"
            },
            tickInterval: 5,
            reversed: true,
            categories: date
        },
        yAxis: {
            title: {
                text: indicator
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: true,
                    radius: 2
                },
                lineWidth: 1,
            }
        },

        series: [{
            type: 'spline',
            name: tickerSymbol + " " + keys[0],
            data: values1
        }, 
        {
            type: 'spline',
            name: tickerSymbol + " " + keys[1],
            data: values2
        },
        {
            type: 'spline',
            name: tickerSymbol + " " + keys[2],
            data: values3
        },
        ]
    });
    }
    
    var refreshFn;
    $("#manRefresh").click(refreshFn = function (){
       console.log("sending ajax call");
        
       var requests = [];
       for (i = 0; i < localStorage.length; i++) {
           
           //send data via Ajax call to server
           var ajaxReq = $.ajax({
               url: 'http://stocksearchusingalp-env.us-east-2.elasticbeanstalk.com/price/' +   localStorage.key(i),
               type: 'GET',
               dataType: "json",
               success: function(response, status, xhr)     {
                   //alert("response: " + response);
                   //debugger;
                   var symbol = response["symbol"];
                   var close = response["close"];
                   var change = (response["close"]-response["last_close"]).toFixed(2);
                   var changePercent = ((change/response["last_close"])*100).toFixed(2);
                   var volume = response["volume"];
                   var image = "";
                   var colorClass = "";
                   if (change > 0) {
                       colorClass = "green";
                       image = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png";
                   } else {
                       colorClass = "red";
                       image = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png";
                   }
                   
                   var favDataArr = [close, change + " (" + changePercent + "%)", volume];
                   localStorage.setItem(symbol, JSON.stringify(favDataArr));
               }, 
               error: function (xhr, status, error) {
                   console.log("error in ajax call for price data");
               }
           }); 
           requests.push(ajaxReq);
       }
       
        $.when.apply($, requests).then(function() {
	       fillFavTable();
    
        });
       
});
    
    var interval;
    $('#autoRefresh').change(function() {
       if ($(this).is(":checked")) {
          interval = setInterval(refreshFn, 5000);
        } else {
            clearInterval (interval);
        }
    });
    
    $('#sortByMenu').change(function () {
        debugger;
        //check for sortBy option selected
        if (!($(this).val() === 'Default')) {
            $('#orderTypeMenu').removeAttr("disabled", false);
            //check for orderType option selected
            var sortBy = $(this).val();
            var orderType = $("#orderTypeMenu").val();
            sortTable(sortBy, orderType)
        } else {
            $('#orderTypeMenu').attr("disabled", "disabled");
        }
    });
    
    $('#orderTypeMenu').change(function () {
        debugger;
        //check for sortBy option selected
        if (!($("#sortByMenu").val() === 'Default')) {
            //check for orderType option selected
            var orderType = $(this).val();
            var sortBy = $("#sortByMenu").val();
            sortTable(sortBy, orderType)
        }
    });
    
    function sortTable(sortBy, orderType) {
        debugger;
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        /*Make a loop that will continue until
        no switching has been done:*/
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            rows = table.getElementsByTagName("tr");
            /*Loop through all table rows (except the
            first, which contains table headers):*/
            for (i = 1; i < (rows.length - 1); i++) {
                //start by saying there should be no switching:
                shouldSwitch = false;
                /*Get the two elements you want to compare,
                one from current row and one from the next:*/
                if (sortBy === "Symbol") {
                    x = rows[i].getElementsByTagName("td")[0];
                    y = rows[i + 1].getElementsByTagName("td")[0];
                    
                     //check if the two rows should switch place:
                    if (orderType === "Ascending") {
                        // for ascending order
                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch= true;
                            break;
                        }
                    } else {
                        // for descending order
                        if (x.innerHTML.toLowerCase() <         y.innerHTML.toLowerCase()) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch= true;
                            break;
                        }
                    }
                } else {
                    
                    if (sortBy === "Price") {
                        x = parseFloat(rows[i].getElementsByTagName("td")[1].innerHTML.replace(/,/g,''));
                        y = parseFloat(rows[i + 1].getElementsByTagName("td")[1].innerHTML.replace(/,/g,''));
                    } else if (sortBy === "Change") {
                        x = parseFloat(rows[i].getElementsByTagName("td")[2].innerHTML.split(" ")[0]);
                        y = parseFloat(rows[i + 1].getElementsByTagName("td")[2].innerHTML.split(" ")[0]);
                    } else if (sortBy === "Change Percent") {
                        var startIndex = [], endIndex = [];
                        var temp = [];
                        var changePercent = [];
                        temp [i] = rows[i].getElementsByTagName("td")[2].innerHTML.split(" ")[1];
                        startIndex [i] = temp [i].indexOf("(") + 1;
                        endIndex [i] = temp [i].indexOf(")") - 1;
                        changePercent [i] = temp[i].substring(startIndex[i], endIndex[i]);
                        
                        temp [i+1] = rows[i+1].getElementsByTagName("td")[2].innerHTML.split(" ")[1];
                        startIndex [i+1] = temp [i+1].indexOf("(") + 1;
                        endIndex [i+1] = temp [i+1].indexOf(")") - 1;
                        changePercent [i+1] = temp[i+1].substring(startIndex[i+1], endIndex[i+1]);
                        
                        x = parseFloat(changePercent [i]);
                        y = parseFloat(changePercent [i+1]);
                    } else if (sortBy === "Volume") {
                        x = parseFloat(rows[i].getElementsByTagName("td")[3].innerHTML.replace(/,/g,''));
                        y = parseFloat(rows[i + 1].getElementsByTagName("td")[3].innerHTML.replace(/,/g,''));      
                    }
                    
                     //check if the two rows should switch place:
                    if (orderType === "Ascending") {
                        // for ascending order
                        if (x > y) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch= true;
                            break;
                        }
                    } else {
                        // for descending order
                        if (x < y) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch= true;
                            break;
                        }
                    }
                }
               
            }
            if (shouldSwitch) {
                /*If a switch has been marked, make the switch
                and mark that a switch has been done:*/
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    
    
    
    
    /* Facebook share */
    var e = document.createElement('script'); e.async = true;
    e.src = document.location.protocol +
            '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
    
    window.fbAsyncInit = function() {
        FB.init({appId: 962521550564563, status: true, cookie: true,
             xfbml: true});
    };
    
    $('#fbBtnDiv').click(function(e){
        var obj = {}, chart;
        var activeTab= $('.nav-tabs .active')
        chart = $($(activeTab.html()).attr("href")).highcharts();
        obj.svg = chart.getSVG();
        obj.type = 'image/png';
        obj.width = 450; 
        obj.async = true;
    
    
        $.ajax({
            type: 'post',
            url: chart.options.exporting.url,        
            data: obj, 
            success: function (data) {            
                var exportUrl = this.url+data;
        
                FB.ui(
                    {
                        method: 'share',
                        href:exportUrl,

                    },
                    
                    (response) =>{
                       if(response &&  !response.error_message) {
                               alert("Posted Successfully");
                           }
                       else{
                           alert("Not Posted");
                       }
                   }
                );
            } 
        });
    });
});
