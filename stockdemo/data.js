// NOTE : all stock lists should be limited to about 100. There is no sense
// displaying a long list that the user will never get through, and dynamic
// loading of stocks is hard.


var stocks = {};
stocks.apple = {
	company : "Apple",
	symbol : "AAPL",
	price : 108.93,
	change : 0.10,
	open : 108.70,
	high : 109.04,
	low : 108.40,
	cap : 638.62E9,
	pe : 16.94,
	div : 0.0173,
	qty : 0,
	industry : "tech",
	logo : "logo/apple.png" };
stocks.google = {
	company : "Google",
	symbol : "GOOGL",
	price : 559.95,
	change : 1.61,
	open : 558.52,
	high : 562.50,
	low : 556.24,
	cap : 374.08E9,
	pe : 28.38,
	div : null,
	qty : 0,
	industry : "tech",
	logo : "logo/google.png" };
stocks.shell = {
	company : "Shell",
	symbol : "RDS.A",
	price : 68.32,
	change : -0.57,
	open : 68.28,
	high : 68.65,
	low : 68.21,
	cap : 226.56E9,
	pe : 13.42,
	div : 0.0550,
	qty : 1,
	industry : "energy",
	logo : "logo/shell.png" };
stocks.ubisoft = {
	company : "Ubisoft",
	symbol : "UBI",
	price : 13.54,
	change : 0.27,
	open : 13.44,
	high : 13.79,
	low : 12.90,
	cap : 1.45E9,
	pe : 195.13,
	div : null,
	qty : 0,
	industry : "tech",
	logo : "logo/ubisoft.png" };
stocks.mcdonalds = {
	company : "McDonald's",
	symbol : "MCD",
	price : 95.21,
	change : 0.10,
	open : 95.22,
	high : 95.42,
	low : 94.93,
	cap : 94.49E9,
	pe : 18.7,
	div : 0.0357,
	qty : 3,
	industry : "food",
	logo : "logo/mcdonalds.png" };
stocks.nestle = {
	company : "Nestle",
	symbol : "NSRGY",
	price : 74.17,
	change : 0.60,
	open : 73.84,
	high : 74.27,
	low : 73.71,
	cap : 237.25E9,
	pe : 0.0,
	div : 0.0273,
	qty : 0,
	industry : "food",
	logo : "logo/nestle.png" };
stocks.starbucks = {
    company : "Starbucks",
    symbol : "SBUX",
    price : 77.71,
    change : -0.14,
    open : 78.19,
    high : 78.48,
    low : 77.41,
    cap : 57.97E9,
    pe : 28.62,
    div : 0.32,
    qty: 0,
	industry : "food",
    logo : "logo/starbucks.png" };
stocks.microsoft = {
    company: "Microsoft",
    symbol : "MSFT",
    price : 49.41,
    change : 0.63,
    open : 48.81,
    high : 49.58,
    low : 48.71,
    cap : 402.86E9,
    pe : 19.36,
    div : 0.31,
    qty : 0,
	industry : "tech",
    logo : "logo/microsoft.png" };

// Gets the list of stocks that will show up in the default view.
function getStocksDefault() {
	var keys = Object.keys(stocks);
	var result = new Array();
	for (var i = 0; i < keys.length; i++) {
		result.push(stocks[keys[i]]);
	}
	return result;
}

// Gets the list of stocks in the preset list with the given name.
function getStocksPreset(name) {
	if (name == "earners") {
		return [stocks.google, stocks.nestle];
	} else if (name == "losers") {
		return [stocks.shell, stocks.starbucks];
	} else if (name == "owned") {
		return getStocksDefault().filter(function(stock) {
			return stock.qty > 0;
		});
	}
}

// Gets the list of stocks in the watchlist.
function getWatchedStocks() {
	return [];
}

// Gets the list of stocks that fit the given search criteria.
function searchStocks(query) {
	query = query.toLowerCase();
	return getStocksDefault().filter(function(stock) {
		return stock.company.toLowerCase().indexOf(query) != -1 ||
			stock.symbol == query ||
			(stock.industry && query.indexOf(stock.industry) != -1);
	});
}

// Gets the data needed to construct a graph of a certain stock property
// (such as 'price') within the given interval of times (represented as
// seconds since Jan 1, 1970).
function getStockGraph(stock, property, start, end) {
	var steps = 300;
	var delta = (end - start) / steps;
	var data = new Array();
	for (var i = 0; i < steps; i++) {
		data.push({
			x : start + (i + 0.5) * delta,
			y : 500 + Math.sin((i / steps) * 20) * 20});
	}
	return data;
}

// Gets the amount of commision paid on the given transaction.
function getCommision(stock, amount) {
	return 1.50;
}

// performs the given stock transaction, returning true on success or false
// on failure.
function performStockTransaction(stock, amount) {
	if (stock.qty + amount < 0) return false;
	stock.qty += amount;
	return true;
}

// Determines whether two stocks are the same.
function stocksEqual(a, b) {
	return a.symbol == b.symbol;
}

// Adds a stock to the watchlist, or does nothing if it is already in the
// watchlist.
function watchStock(stock) {
	// TODO
}

// Removes a stock from the watchlist, or does nothing if it is not in the
// watchlist.
function unwatchStock(stock) {
	// TODO
}
