import axios from 'axios';
import * as mongo from './mongoUtils';
import * as event from '../../src/actions/eventTypes';

export default function handleSocketEventsAndUpdateSchema(io, Stock) {
	io.on('connect', function(socket) {
		console.log('New client connected, id:'.bold.green, socket.id);
		socket.emit('clientConnected', 'Connected to server');
		
		socket.on('server/addStock', function(stockCode) {
			const url = `https://www.quandl.com/api/v3/datasets/WIKI/${stockCode}.json?` +
      `order=asc&api_key=${process.env.API_KEY}`;

			axios.get(url)
				.then(res => {
					mongo.addDocs(Stock, res.data.dataset)
						.then(() => {
							socket.emit(event.STOCK_ADDED_EVENT, res.data);
							socket.broadcast.emit(event.STOCK_ADDED_EVENT, res.data);
						})
						.catch(err => {
							socket.emit(event.STOCK_ADD_FAILED_EVENT, err);
						});
				})
				.catch(error => {
					socket.emit(event.STOCK_FETCH_FAILED_EVENT, error);
				});
		});

		socket.on('server/loadStocks', function() {
			mongo.load(Stock)
				.then(stocks => {
					const eventName = stocks.length > 0 ? event.STOCKS_LOADED_EVENT : 
						event.STOCKS_LOAD_EMPTY_EVENT;
					socket.emit(eventName, stocks);
				})
				.catch(err => {
					const eventName = event.STOCKS_LOAD_FAILED_EVENT;
					socket.emit(eventName, '');
				});
		});
	
		socket.on('server/removeStock', function(stockCode) {
			mongo.removeDocs(Stock, stockCode)
				.then(() => {
					socket.emit(event.STOCK_REMOVED_EVENT, stockCode);
					socket.broadcast.emit(event.STOCK_REMOVED_EVENT, stockCode);
				})
				.catch(err => {
					socket.emit(event.STOCK_REMOVE_FAILED_EVENT, stockCode);
				});
		});
	
		socket.on('disconnect', function() {
			console.log('Client disconnected');
		});
	});
}