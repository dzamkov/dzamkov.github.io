// Removes all child nodes of the given node.
function clearNodeChildren(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

// Writes stock information into a set of elements, each obtained with a call
// to 'prop' with the name of the relevant property.
function writeStockInfo(prop, stock) {
	prop("company").innerText = stock.company;
	prop("symbol").innerText = stock.symbol;
	prop("logo").src = stock.logo;
	prop("price").innerText = stock.price.toFixed(2);
	prop("change").innerText =
		(stock.change >= 0 ? "\u25B2" : "\u25BC") +
		stock.change.toFixed(2) +
		" (" + ((stock.change / stock.price) * 100).toFixed(2) + "%)";
	prop("change").style.color = (stock.change >= 0 ? "green" : "red");
	prop("open").innerText = stock.open.toFixed(2);
	prop("high").innerText = stock.high.toFixed(2);
	prop("low").innerText = stock.low.toFixed(2);
	function formatLarge(n) {
		var suffix = "";
		if (n >= 1000) {
			n /= 1000;
			suffix = "K";
		}
		if (n >= 1000) {
			n /= 1000;
			suffix = "M";
		}
		if (n >= 1000) {
			n /= 1000;
			suffix = "B";
		}
		return n.toFixed(1) + suffix;
	}
	prop("cap").innerText = formatLarge(stock.cap);
	prop("pe").innerText = stock.pe.toFixed(2);
	prop("div").innerText = (stock.div ?
		(stock.div * 100).toFixed(2) + "%" : "--");
	prop("qty").innerText = stock.qty;
	prop("value").innerText = "$" + (stock.price * stock.qty).toFixed(2);
}

// Creates an element for a stock card of the given stock.
function createCard(stock) {
	var template = document.getElementById("card-template").firstChild;
	var card = template.cloneNode(true);
	function prop(item) {
		return card.getElementsByClassName("card-" + item)[0] ||
			window.dummy;
	}
	writeStockInfo(prop, stock);
	card.stock = stock;
	return card;
}

// Populates an element with stock cards based on the data from the given list.
function populateCards(element, stockList) {
	clearNodeChildren(element);
	for (var i = 0; i < stockList.length; i++) {
		var card = createCard(stockList[i]);
		element.appendChild(card);
	}
	var tail = document.createElement("div");
	tail.className="fake-card";
	element.appendChild(tail);
}

// Populates the main view with stock cards based on the data from the given
// list.
function populateMain(stockList) {
	populateCards(window.resultlist, stockList);
}

// Populates the watchlist with stock cards based on the data from the given
// list.
function populateWatchlist(stockList) {
	populateCards(window.watchlist, stockList);
}

// Updates the graph for the detail view.
function updateDetailGraph() {
	stock = window.detail.stock;
	var property = window.detail.getElementsByClassName("detail-graph-property")[0];
	property = property.options[property.selectedIndex].value;
	var range = window.detail.getElementsByClassName("detail-graph-range")[0];
	range = range.options[range.selectedIndex].value;
	var now = (new Date()).getTime() / 1000.0;
	var start = now;
	var end = now;
	if (range == "day") start -= 24 * 60 * 60;
	else if (range == "week") start -= 24 * 60 * 60 * 7;
	else if (range == "month") start -= 24 * 60 * 60 * 30;
	else if (range == "quarter") start -= 24 * 60 * 60 * 30 * 4;
	else if (range == "year") start -= 24 * 60 * 60 * 365;
	var data = getStockGraph(stock, property, start, end);
	var cont = window.detail.getElementsByClassName("detail-graph-container")[0];
	if (cont.copy) {
		cont.parentNode.replaceChild(cont.copy, cont);
		cont = cont.copy;
	}
	cont.copy = cont.cloneNode(true);
	aRect = cont.getBoundingClientRect();
	var d = window.detail.getElementsByClassName("detail-graph-data")[0];
	var y = window.detail.getElementsByClassName("detail-graph-y")[0];
	bRect = y.getBoundingClientRect();
	function formatDollar(value) {
		return "$" + value.toFixed(2);
	}
	var min = Infinity;
	var max = -Infinity;
	for (var i = 0; i < data.length; i++) {
		min = Math.min(min, data[i].y);
		max = Math.max(max, data[i].y);
	}
	var dif = max - min;
	min -= dif * 0.1;
	max += dif * 0.1;
	var graph = new Rickshaw.Graph({
		element: window.detail.getElementsByClassName("detail-graph-data")[0],
		renderer: "line",
		min : min, max : max,
		width: (aRect.right - aRect.left) - (bRect.right - bRect.left),
		height: aRect.bottom - aRect.top,
		series: [{ name : property, data : data, color : "steelblue" }]});
	new Rickshaw.Graph.Axis.Time({ graph : graph });
	new Rickshaw.Graph.Axis.Y({ graph : graph,
		orientation : "left",
		tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
		element: window.detail.getElementsByClassName("detail-graph-y")[0] });
	graph.render();
	new Rickshaw.Graph.HoverDetail({ graph : graph,
		yFormatter : formatDollar });
}

// Updates the trade information for the detail view.
function updateDetailTrade() {
	var detail = window.detail;
	function prop(item) {
		return detail.getElementsByClassName("detail-trade-" + item)[0];
	}
	var type = prop("type");
	type = type.options[type.selectedIndex].value;
	var amount = (type == "buy" ? 1 : -1) * prop("qty").value;
	var commision = getCommision(detail.stock, amount);
	prop("price").innerText = "$" + detail.stock.price.toFixed(2);
	prop("commision").innerText = "$" + commision.toFixed(2);
	var cost = amount * detail.stock.price + commision;
	prop("total").innerText = "The total " + (cost > 0.0 ? "cost" : "gain") +
		" for the transaction is $" + Math.abs(cost).toFixed(2);
}

// Submits the current trade in the detail view.
function submitDetailTrade() {
	var detail = window.detail;
	function prop(item) {
		return detail.getElementsByClassName("detail-trade-" + item)[0];
	}
	var type = prop("type");
	type = type.options[type.selectedIndex].value;
	var amount = (type == "buy" ? 1 : -1) * prop("qty").value;
	var conf = "Are you sure you want to " + type + " " + Math.abs(amount) +
		" share(s) of " + detail.stock.company +"?";
	if (confirm(conf)) {
		if (performStockTransaction(detail.stock, amount)) {
			showDetail(detail.stock);
		} else {
			alert("Could not perform transaction");
		}
	}
}

// Shows a detail view for the given stock.
function showDetail(stock) {
	var detail = window.detail;
	detail.stock = stock;
	function prop(item) {
		return detail.getElementsByClassName("detail-" + item)[0] ||
			window.dummy;
	}
	writeStockInfo(prop, stock);
	updateDetailTrade();
	detail.className = "detail-2";
	detail.style.visibility = "visible";
	var detailClose = document.getElementsByClassName("detail-close")[0];
	detailClose.style.visibility = "visible";
	setTimeout(updateDetailGraph, 500);
}

// Hides whatever detail view is currently displayed.
function hideDetail() {
	window.detail.className = "detail-small";
	window.detail.style.visibility = "hidden";
	var detailClose = document.getElementsByClassName("detail-close")[0];
	detailClose.style.visibility = "hidden";
}

// Prevents an event from propogating.
function pauseEvent(e) {
	if (e.stopPropogation) e.stopPropogation();
	if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	e.returnValue = false;
}

// Event handler for a click for a card.
function cardClick(target) {
	showDetail(target.stock);
}

// Event handler for mouse down on a card.
function cardMouseDown(target, e) {
	if (e.button == 0 && !window.dragging) {
		pauseEvent(e);
		var rect = target.getBoundingClientRect();
		var cardWidth = rect.right - rect.left;
		var cardHeight = rect.bottom - rect.top;
		var originalParent = target.parentNode;
		var originalPosition = target.style.position;
		var exitHole = document.createElement("div");
		exitHole.className = "card-hole-exit";
		var offsetX = e.clientX - rect.left;
		var offsetY = e.clientY - rect.top;
		var enterHole = null;
		var dragHole = null;
		if (target.parentNode == window.watchlist) {
			dragHole = document.getElementById("drag-hole");
			dragHole.className = "drag-hole";
			dragHole.style.visibility = "visible";
		}
		window.dragging = {
			finish : function() {
				var tRect = target.getBoundingClientRect();
				var wRect = window.watchlist.getBoundingClientRect();
				document.body.removeChild(target);
				if (dragHole) {
					dragHole.className = "drag-hole-small";
					dragHole.style.visibility = "hidden";
				}
				if (enterHole) {
					var newCard = createCard(target.stock);
					originalParent.replaceChild(newCard, exitHole);
					var oldCard = createCard(target.stock);
					enterHole.parentNode.replaceChild(oldCard, enterHole);
					watchStock(target.stock);
					var cur = window.watchlist.firstChild;
					while (cur) {
						if (cur.stock && stocksEqual(cur.stock, oldCard.stock)
							&& cur != oldCard)
						{
							window.watchlist.removeChild(cur);
						}
						cur = cur.nextSibling;
					}
				} else if (exitHole.parentNode == window.watchlist &&
					tRect.right < wRect.left)
				{
					window.watchlist.removeChild(exitHole);
					unwatchStock(target.stock);
				} else {
					originalParent.replaceChild(target, exitHole);
					var dx = rect.left - tRect.left;
					var dy = rect.top - tRect.top;
					var threshold = 5.0;
					if (dx * dx + dy * dy < threshold * threshold) {
						cardClick(target);
					}
				}
				target.style.position = originalPosition;
				target.style.left = "";
				target.style.top = "";
			},
			update : function(e) {
				var left = e.clientX - offsetX;
				var top = e.clientY - offsetY;
				var wRect = window.watchlist.getBoundingClientRect();
				if (left + cardWidth >= wRect.left &&
					originalParent != window.watchlist)
				{
					if (!enterHole) {
						var cur = window.watchlist.firstChild;
						while (cur != null) {
							if (cur.className == "fake-card") break;
							var cRect = cur.getBoundingClientRect();
							if (top < cRect.top) break;
							cur = cur.nextSibling;
						}
						enterHole = document.createElement("div");
						enterHole.className = "card-hole-enter-small";
						window.watchlist.insertBefore(enterHole, cur);
						setTimeout(function() {
							enterHole.className = "card-hole-enter";
						}, 20);
					}
				} else if (enterHole) {
					enterHole.parentNode.removeChild(enterHole);
					enterHole = null;
				}
				target.style.left = left + "px";
				target.style.top = top + "px";
			}
		};
		originalParent.replaceChild(exitHole, target);
		document.body.appendChild(target);
		target.style.position = "fixed";
		target.style.left = rect.left + "px";
		target.style.top = rect.top + "px";
	}
}

// Event handler for mouse move (dragging).
function windowMouseMove(e) {
	if (window.dragging) {
		pauseEvent(e);
		window.dragging.update(e);
	}
}

// Event handler for mouse up on a card.
function windowMouseUp(e) {
	if (e.button == 0 && window.dragging) {
		pauseEvent(e);
		window.dragging.finish();
		window.dragging = null;
	}
}

// Event handler for mouse over.
function windowMouseOver(e) {
	if (!window.dragging) {
		var target = e.target;
		var ref = null;
		while (true) {
			ref = target.getAttribute("info");
			if (ref) break;
			target = target.parentNode;
			if (!target.getAttribute) return;
		}
		var content = info[ref];
		if (!target.leave && content) {
			id = setTimeout(function() {
				if (window.dragging) return;
				tRect = target.getBoundingClientRect();
				var popup = document.createElement("div");
				popup.className = "info-popup";
				popup.style.position = "fixed";
				popup.style.left = tRect.left + "px";
				popup.style.top = tRect.bottom + "px";
				popup.innerText = content;
				document.body.appendChild(popup);
				target.onmousedown = target.leave = function() {
					if (popup) {
						document.body.removeChild(popup);
						popup = null;
					}
					target.leave = null;
				}
			}, infoTimeout);
			target.leave = function() {
				clearTimeout(id);
				target.leave = null;
			}
		}
	}
}

// Event handler for mouse out.
function windowMouseOut(e) {
	var target = e.target;
	if (target.leave) target.leave();
	if (target.tagName == "TD" && target.parentNode.leave)
		target.parentNode.leave();
}

// Repopulates the main view based on the current search term.
function search() {
	var e = document.getElementsByClassName("search")[0];
	populateMain(e.value == "" ? getStocksDefault() : searchStocks(e.value));
}

// Event handler for key down on search box.
function searchKeyDown(e) {
	if (e.keyCode == 13) search();
}

// Opens a preset stock list.
function openPreset(name) {
	populateMain(getStocksPreset(name));
}

// On page load
window.onload = function() {

	// Set up window event handlers.
	window.addEventListener("mousemove", windowMouseMove);
	window.addEventListener("mouseup", windowMouseUp);
	window.addEventListener("mouseover", windowMouseOver);
	window.addEventListener("mouseout", windowMouseOut);

	// Identify elements.
	window.dummy = document.getElementById("dummy");
	window.detail = document.getElementById("detail");
	window.resultlist = document.getElementsByClassName("main-content")[0];
	window.watchlist = document.getElementsByClassName("side-content")[0];

	populateMain(getStocksDefault());
	populateWatchlist(getWatchedStocks());
}
