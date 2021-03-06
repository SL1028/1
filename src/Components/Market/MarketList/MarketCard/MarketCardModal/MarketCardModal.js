import React from 'react';
import './MarketCardModal.css';
import $ from 'jquery';
import Chart from 'chart.js';

const lvlXP = [[20,60,160,360,760,1560,2560,4560,7560],[100,300,700,1500,2500,4500,8500],[250,750,1750,3750,7750],[1000,3000,7000]];
const newLvlXP = [[1,5,14,30,60,100,150,220,300,400],[1,5,14,25,40,60,85,115],[1,4,10,20,32,46],[1,3,6,11]];
const sumProp = (array, prop) => {
	let sum = 0;
	for (let i = 0; i < array.length; i++) {
		sum += Number(array[i][prop]);
	}
	return sum;
}

const pivot = (obj) => {
	let arr = [];
	let values = Object.values(obj);
	let keys = Object.keys(obj);
	for (let i = 0; i < values[0].length; i++) {
		let arrEntry = {
			lvl: i + 1
		};
		for (let j = 0; j < values.length; j++) {
			if (keys[j] === 'abilities') {
				let abilities = [];
				for (let k = i; k >= 0; k--) {
					if (obj.abilities[k].length !== 0) {
						abilities.push(obj.abilities[k][0]);
					}
				}
				arrEntry[keys[j]] = abilities;
			} else {
				arrEntry[keys[j]] = values[j][i];
			}
		}
		arr.push(arrEntry);
	}
	return arr;
}

class MarketCardModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			forSale: [],
			selected: [],
			sortMethod: 'priceBcxAsc',
			panel: 'forSale',
			loading: true,
			history: null
		};
		this.updateSort = this.updateSort.bind(this);
		this.getBCX = this.getBCX.bind(this);
		this.updatePanel = this.updatePanel.bind(this);
		this.handlePanelChange = this.handlePanelChange.bind(this);
		this.multiSelectBCX = this.multiSelectBCX.bind(this);
		this.multiSelectPrice = this.multiSelectPrice.bind(this);
	}

	updateSort(method) {
		let forSale = this.state.forSale;
		if (method === 'priceAsc') {
			forSale.sort((a, b) => {
				return Number(a.buy_price) - Number(b.buy_price);
			});
		} else if (method === 'priceDec') {
			forSale.sort((a, b) => {
				return Number(b.buy_price) - Number(a.buy_price);
			});
		} else if (method === 'lvlAsc') {
			forSale.sort((a, b) => {
				return Number(a.lvl) - Number(b.lvl);
			});
		} else if (method === 'lvlDec') {
			forSale.sort((a, b) => {
				return Number(b.lvl) - Number(a.lvl);
			});
		} else if (method === 'bcxAsc') {
			forSale.sort((a, b) => {
				return Number(a.bcx) - Number(b.bcx);
			});
		} else if (method === 'bcxDec') {
			forSale.sort((a, b) => {
				return Number(b.bcx) - Number(a.bcx);
			});
		} else if (method === 'priceBcxAsc') {
			forSale.sort((a, b) => {
				let aPriceBcx = Number(a.buy_price) / Number(a.bcx);
				let bPriceBcx = Number(b.buy_price) / Number(b.bcx);
				return aPriceBcx - bPriceBcx;
			});
		} else if (method === 'priceBcxDec') {
			forSale.sort((a, b) => {
				let aPriceBcx = Number(a.buy_price) / Number(a.bcx);
				let bPriceBcx = Number(b.buy_price) / Number(b.bcx);
				return bPriceBcx - aPriceBcx;
			});
		} else if (method === 'selected') {
			forSale.sort((a, b) => {
				if (this.state.selected.includes(b) && !this.state.selected.includes(a)) {
					return 1;
				} else {
					return -1;
				}
			})
		}

		this.setState({sortMethod: method});
	}

	getBCX(xp) {
		if (xp === 0) {
			return 1;
		} else if (this.props.info.edition === 'Untamed' || (this.props.info.edition === 'Reward' && this.props.info.detailID > 223)) {
			return xp;
		}

		let alpha_xp = [20,100,250,1000];
		let alpha_gold_xp = [250,500,1000,2500];
		let beta_xp = [15,75,175,750];
		let beta_gold_xp = [200,400,800,2000];
		let rarity = this.props.info.rarity === 'Common' ? 1 : this.props.info.rarity === 'Rare' ? 2 : this.props.info.rarity === 'Epic' ? 3 : 4;

		if (this.props.info.edition === 'Alpha') {
			if (this.props.info.gold) {
				return Math.floor(xp / alpha_gold_xp[rarity - 1]);
			} else {
				return Math.floor(1 + (xp / alpha_xp[rarity - 1]));
			}
		} else {
			if (this.props.info.gold) {
				return Math.floor(xp / beta_gold_xp[rarity - 1]);
			} else {
				return Math.floor(1 + (xp / beta_xp[rarity - 1]));
			}
		}
	}

	updatePanel(panel) {
		let currentPanel = this.state.panel;
		let currentId = 'panel' + currentPanel;
		let newId = 'panel' + panel;
		if (panel !== currentPanel) {
			document.getElementById(currentId).className = 'market-cardModal-panel-header';
			document.getElementById(newId).className = 'market-cardModal-panel-header activePanel';
			this.setState({panel: panel});
		}
	}

	handlePanelChange(e) {
		let newPanel = e.target.value;
		this.updatePanel(newPanel);
	}

	multiSelectBCX() {
		const matchUID = this.props.cart.map(item => {return item.uid});
		let count = document.getElementById('bcx').value || 0;
		if (count === 0) {
			let toast = document.getElementById('market-cardModal-required-toast');
			toast.className += ' show';
			setTimeout(()=>{toast.className = toast.className.replace(' show', '')}, 3000);
		} else {
			let forSale = this.state.forSale;
			let multi = [];
			
			forSale.sort((a, b) => {
				let aPriceBcx = Number(a.buy_price) / Number(a.bcx);
				let bPriceBcx = Number(b.buy_price) / Number(b.bcx);
				if (aPriceBcx < bPriceBcx) {
					return -1;
				} else if (aPriceBcx > bPriceBcx) {
					return 1;
				} else {
					return b.bcx - a.bcx;
				}
			});

			let i = 0;
			let bcx = 0;
			let cards = 0;
			while (bcx < count && i < forSale.length && cards < 45) {
				if (forSale[i].bcx + bcx <= count && forSale[i].uid !== matchUID[i]) {
					multi.push(forSale[i]);
					cards++;
					bcx += forSale[i].bcx;
				}
				i++;
			}

			this.setState({
				selected: multi,
				panel: 'forSale'
			});
		}
	}

	multiSelectPrice() {
		const matchUID = this.props.cart.map(item => {return item.uid});
		let count = document.getElementById('price').value || 0;
		if (count === 0) {
			let toast = document.getElementById('market-cardModal-required-toast');
			toast.className += ' show';
			setTimeout(()=>{toast.className = toast.className.replace(' show', '')}, 3000);
		} else {
			let forSale = this.state.forSale;
			let multi = [];
			
			forSale.sort((a, b) => {
				let aPriceBcx = Number(a.buy_price) / Number(a.bcx);
				let bPriceBcx = Number(b.buy_price) / Number(b.bcx);
				if (aPriceBcx < bPriceBcx) {
					return -1;
				} else if (aPriceBcx > bPriceBcx) {
					return 1;
				} else {
					return b.bcx - a.bcx;
				}
			});

			let i = 0;
			let price = 0;
			let cards = 0;
			while (price < count && i < forSale.length && cards < 45) {
				if (forSale[i].buy_price + price <= count && forSale[i].uid !== matchUID[i]) {
					multi.push(forSale[i]);
					cards++;
					price += forSale[i].buy_price;
				}
				i++;
			}

			this.setState({
				selected: multi,
				panel: 'forSale'
			});
		}
	}

	componentDidMount() {
		var forSale = [];
		var distinctSale = [];
		var url = 'https://game-api.splinterlands.io/market/for_sale_by_card?'
		const urlID = 'card_detail_id=' + this.props.info.detailID;
		const urlGold = '&gold=' + this.props.info.gold;
		const urlEdition = '&edition=' + (this.props.info.edition === 'Alpha' ? '0' : this.props.info.edition === 'Beta' ? '1' : this.props.info.edition === 'Promo' ? '2' : this.props.info.edition === 'Reward' ? '3' : '4');
		url += urlID + urlGold + urlEdition;
		$.ajax({
			type: 'GET',
			url: url,
			jsonpCallback: 'testing',
		  	dataType: 'json',
		  	success: function(saleData) {
				saleData.sort((a, b) => parseFloat(a.buy_price) / parseFloat(a.xp) === parseFloat(b.buy_price) / parseFloat(b.xp) ? parseFloat(a.buy_price) === parseFloat(b.buy_price) ? parseFloat(a.xp) - parseFloat(b.xp) : parseFloat(a.buy_price) - parseFloat(b.buy_price) : parseFloat(a.buy_price) / parseFloat(a.xp) - parseFloat(b.buy_price) / parseFloat(b.xp));
		  		this.setState({
		  			forSale: forSale = saleData.map(listing => {
			  			let rarity = this.props.info.rarity === 'Common' ? 1 : this.props.info.rarity === 'Rare' ? 2 : this.props.info.rarity === 'Epic' ? 3 : 4;
						let edition = this.props.info.edition;
						let detailID = this.props.info.detailID;
						let lvl = 1;
						let xpRates = edition === 'Untamed' || (edition === 'Reward' && detailID >= 225) ? newLvlXP : lvlXP;
						let increment = edition === 'Untamed' || (edition === 'Reward' && detailID >= 225) ? 1 : 2;
						let bcx = this.getBCX(listing.xp);
						for (let i = xpRates[rarity - 1].length - 1; i >= 0; i--) {
			          		if (listing.xp >= xpRates[rarity - 1][i]) {
			          			lvl = i + increment;
			          			break;
			          		}
			          	}
	      				return ({
	      					seller: listing.seller,
	      					uid: listing.uid,
	      					buy_price: Number(listing.buy_price),
	      					lvl: lvl,
	      					currency: listing.currency,
	      					market_id: listing.market_id,
	      					name: this.props.info.name,
	      					bcx: bcx
	      				});
		  			}),
		  			loading: false
		  		});
		  	}.bind(this),
		  	error: function(e) {
		  		console.log('There was an error retrieving the sale data.');
		  	}
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.panel === 'forSale' && prevState.panel === 'multiSelect' && this.state.selected !== prevState.selected) {
			this.updateSort('selected');
		} else if (this.state.panel === 'history' && prevState.panel !== 'history') {
			let edition = this.props.info.edition === 'Alpha' ? 0 : this.props.info.edition === 'Beta' ? 1 : this.props.info.edition === 'Promo' ? 2 : this.props.info.edition === 'Reward' ? 3 : 4;
			let target = "sm.card_value.card_id=" + this.props.info.detailID + ";edition=" + edition + ";gold=" + this.props.info.gold.toString().charAt(0).toUpperCase() + this.props.info.gold.toString().substring(1);
			if (sessionStorage.getItem('history') && Date.parse(JSON.parse(sessionStorage.getItem('history')).expiry) > (new Date())) {
				let history = JSON.parse(sessionStorage.getItem('history')).data;
				for (let i = 0; i < history.length; i++) {
					if (history[i].target === target) {
						let data = [];
						let labelArray = [];
						for (let j = 0; j < history[i].datapoints.length; j++) {
					        let milliseconds = history[i].datapoints[j][1] * 1000;
					        let date = new Date(milliseconds).toLocaleDateString('en-US', { timeZone: 'GMT' });
					        labelArray.push(date);
					        data.push({
					        	t: new Date(),
					        	y: history[i].datapoints[j][0]
					        });
				        }
				        let config = {
						  type: 'line',
						  data: {
						    labels: labelArray,
						    datasets: [{
						      label: 'Price(USD)',
						      data: data,
						      fill: false,
						      borderColor: ['rgba(13, 33, 64, 1)'],
						      borderWidth: 3
						    }]
						  },
						  options: {
						    responsive: true,
						    maintainAspectRatio: false
						  }
						};
						let ctx = document.getElementById('myChart').getContext('2d');
						let myChart = new Chart(ctx, config);
						break;
					}
				}
			} else {
				$.ajax({
					type: 'GET',
					url: 'http://18.223.152.60:8080/history',
					jsonpCallback: 'testing',
				  	dataType: 'json',
				  	success: function(history) {
						let expiry = new Date();
						expiry.setDate(expiry.getDate() + 1);
						expiry.setUTCHours(0, 0, 0, 0);
				  		let historyObj = {
				  			expiry: expiry,
				  			data: history
				  		};
				  		sessionStorage.setItem('history', JSON.stringify(historyObj));
				  		for (let i = 0; i < history.length; i++) {
							if (history[i].target === target) {
								let data = [];
								let labelArray = [];
								for (let j = 0; j < history[i].datapoints.length; j++) {
							        let milliseconds = history[i].datapoints[j][1] * 1000;
							        let date = new Date(milliseconds).toLocaleDateString('en-US', { timeZone: 'GMT' });
							        labelArray.push(date);
							        data.push({
							        	t: new Date(),
							        	y: history[i].datapoints[j][0]
							        });
						        }
						        let config = {
								  type: 'line',
								  data: {
								    labels: labelArray,
								    datasets: [{
								      label: 'Price(USD)',
								      data: data,
								      fill: false,
								      borderColor: ['rgba(13, 33, 64, 1)'],
								      borderWidth: 3
								    }]
								  },
								  options: {
								    responsive: true,
								    maintainAspectRatio: false
								  }
								};
								let ctx = document.getElementById('myChart').getContext('2d');
								let myChart = new Chart(ctx, config);
								break;
							}
						}
				  	},
				  	error: function(e) {
				  		console.log('There was an error retrieving the price history');
				  	}
				});
			}
		}
	}

	render() {
		const matchUID = this.props.cart.map(item => {return item.uid});
	    return (
	    	<div className='market-cardModal'>
	    		<div className='market-cardModal-overlay' onClick={this.props.closeModal}></div>
	    		<div className='market-cardModal-content' >
        			<div className='market-cardModal-exit' onClick={this.props.closeModal}><i className='fas fa-times'></i></div>
	    			<h2 className={this.props.info.gold ? 'gold' : ''}>{this.props.info.name + (this.props.info.gold ? ' (Gold)' : '')}</h2>
	    			<div className='market-cardModal-img-container'>
	    				<img className='market-cardModal-img' src={this.props.info.img} />
	    			</div>
	    			<div className='market-cardModal-info-container'>
		    			<div className='market-cardModal-panel-header-container'>
			    			<h3 id='panelforSale' className={this.state.panel === 'forSale' ? 'market-cardModal-panel-header activePanel' : 'market-cardModal-panel-header'} onClick={() => {
								let currentPanel = this.state.panel;
								let currentId = 'panel' + currentPanel;
								if (currentPanel !== 'forSale') {
									document.getElementById(currentId).className = 'market-cardModal-panel-header';
									document.getElementById('panelforSale').className = 'market-cardModal-panel-header activePanel';
									this.setState({panel: 'forSale'});
								}
			    			}}>Cards For Sale</h3>
			    			<h3 id='panelmultiSelect' className={this.state.panel === 'multiSelect' ? 'market-cardModal-panel-header activePanel': 'market-cardModal-panel-header'} onClick={() => {
								let currentPanel = this.state.panel;
								let currentId = 'panel' + currentPanel;
								if (currentPanel !== 'multiSelect') {
									document.getElementById(currentId).className = 'market-cardModal-panel-header';
									document.getElementById('panelmultiSelect').className = 'market-cardModal-panel-header activePanel';
									this.setState({panel: 'multiSelect'});
								}
			    			}}>MultiSelect</h3>
			    			<h3 id='panelstats' className={this.state.panel === 'stats' ? 'market-cardModal-panel-header activePanel': 'market-cardModal-panel-header'} onClick={() => {
								let currentPanel = this.state.panel;
								let currentId = 'panel' + currentPanel;
								if (currentPanel !== 'stats') {
									document.getElementById(currentId).className = 'market-cardModal-panel-header';
									document.getElementById('panelstats').className = 'market-cardModal-panel-header activePanel';
									this.setState({panel: 'stats'});
								}
			    			}}>Stats</h3>
			    			{/* <h3 id='panelhistory' className={this.state.panel === 'history' ? 'market-cardModal-panel-header activePanel': 'market-cardModal-panel-header'} onClick={() => {
								let currentPanel = this.state.panel;
								let currentId = 'panel' + currentPanel;
								if (currentPanel !== 'history') {
									document.getElementById(currentId).className = 'market-cardModal-panel-header';
									document.getElementById('panelhistory').className = 'market-cardModal-panel-header activePanel';
									this.setState({panel: 'history'});
								}
			    			}}>Price History</h3>*/}
			    			<span className='market-cardModal-panel-small-container'>
			    				Panel: 
				    			<select className='market-cardModal-panel-small' onChange={this.handlePanelChange}>
						            <option value='forSale' selected={this.state.panel === 'forSale'}>Cards For Sale</option>
						            <option value='multiSelect' selected={this.state.panel === 'multiSelect'}>MultiSelect</option>
						            <option value='stats' selected={this.state.panel === 'stats'}>Stats</option>
						            {/* <option value='history' selected={this.state.panel === 'history'}>Price History</option>*/}
						        </select>
					        </span>
		    			</div>
		    			
		    			{this.state.panel === 'forSale' ? <div className='market-cardModal-table-container'>
		    				<table className='market-cardModal-table'>
		    					<thead>
		    						<tr>
		    							<th onClick={() => {
		    								this.updateSort('selected');
		    							}} style={{cursor: 'pointer'}}>{this.state.sortMethod === 'selected' ? <i className='fas fa-caret-down'></i> : ''}</th>
		    							<th onClick={() => {
		    								this.state.sortMethod === 'lvlDec' ? this.updateSort('lvlAsc') : this.updateSort('lvlDec');
		    							}} style={{cursor: 'pointer'}}>Level <i className={'market-cardModal-table-sortIcon ' + (this.state.sortMethod === 'lvlAsc' ? 'fas fa-caret-up' : this.state.sortMethod === 'lvlDec' ? 'fas fa-caret-down' : '')}></i></th>
		    							<th onClick={() => {
		    								this.state.sortMethod === 'bcxDec' ? this.updateSort('bcxAsc') : this.updateSort('bcxDec');
		    							}} style={{cursor: 'pointer'}}>BCX <i className={'market-cardModal-table-sortIcon ' + (this.state.sortMethod === 'bcxAsc' ? 'fas fa-caret-up' : this.state.sortMethod === 'bcxDec' ? 'fas fa-caret-down' : '')}></i></th>
		    							<th onClick={() => {
		    								this.state.sortMethod === 'priceAsc' ? this.updateSort('priceDec') : this.updateSort('priceAsc');
		    							}} style={{cursor: 'pointer'}}>Price <i className={'market-cardModal-table-sortIcon ' + (this.state.sortMethod === 'priceAsc' ? 'fas fa-caret-up' : this.state.sortMethod === 'priceDec' ? 'fas fa-caret-down' : '')}></i></th>
		    							<th onClick={() => {
		    								this.state.sortMethod === 'priceBcxAsc' ? this.updateSort('priceBcxDec') : this.updateSort('priceBcxAsc');
		    							}} style={{cursor: 'pointer'}}>$/BCX <i className={'market-cardModal-table-sortIcon ' + (this.state.sortMethod === 'priceBcxAsc' ? 'fas fa-caret-up' : this.state.sortMethod === 'priceBcxDec' ? 'fas fa-caret-down' : '')}></i></th>
		    							<th>Seller</th>
		    							<th>Card ID</th>
		    						</tr>
		    					</thead>
		    					{this.state.loading ? '' :
		    					<tbody>
		    						{this.state.forSale.map(listing => {
		    							return(
		    								<tr>
		    									<td className='center'><input type='checkbox' onClick={() => {
		    										let selected = this.state.selected;
		    										if (selected.length >= 45 && !selected.includes(listing)) {
		    											let toast = document.getElementById('market-cardModal-tooMany-toast');
		    											toast.className += ' show';
		    											setTimeout(() => {toast.className = toast.className.replace(' show', '')}, 3000);
		    										} else if (selected.includes(listing)) {
		    											for (let i = 0; i < selected.length; i++) {
		    												if (selected[i].uid === listing.uid) {
		    													selected.splice(i, 1);
		    												}
		    											}
		    										} else {
		    											selected.push(listing);
		    										}		    										
		    										this.setState({selected: selected});
		    									}} disabled={matchUID.includes(listing.uid)} checked={this.state.selected.includes(listing)}/></td>
		    									<td className='center'>{listing.lvl}</td>
		    									<td className='center'>{listing.bcx}</td>
		    									<td className='center'>${Number(listing.buy_price).toFixed(3)}</td>
		    									<td className='center'>${(Number(listing.buy_price)/listing.bcx).toFixed(3)}</td>
		    									<td className='center'>{listing.seller.length > 8 ? listing.seller.substring(0, 8) + '...' : listing.seller}</td>
		    									<td className='right'>{listing.uid}</td>
		    								</tr>
		    							);
		    						})}
		    					</tbody> }
		    				</table>
		    				{this.state.loading ? <div className='loader-modal-container'><div className='loader-modal'></div></div> : ''}
		    			</div> : this.state.panel === 'multiSelect' ? <div className='market-cardModal-table-container'>
			    			<div className='market-cardModal-multiselect'>
			    				<p>{this.state.forSale.length} card{this.state.forSale.length === 1 ? '' : 's'} on the market currently.</p>
			    				<p>Note: We currently only support purchases up to 45 cards.</p>
			    				<div className='multiselect-half left'>
			    					<h4>Select BCX</h4>
			    					<p>Find desired BCX for lowest total price</p>
			    					<input id='bcx' type='number' className='multiSelect-input' placeholder='Desired BCX' />
			    					<button onClick={this.multiSelectBCX}>Search by BCX</button>
			    				</div>
			    				<div className='multiselect-half'>
			    					<h4>Select Price</h4>
			    					<p>Find maximum BCX for desired price</p>
			    					<input id='price' type='number' className='multiSelect-input' placeholder='Total Price (USD)' />
			    					<button onClick={this.multiSelectPrice}>Search by Price</button>
			    				</div>
			    			</div>
		    			</div> : this.state.panel === 'stats' ? <div className='market-cardModal-table-container'>
			    			<div className='market-cardModal-stats'>
			    				<span>Splinter: {this.props.info.element}</span>
			    				<span>Edition: {this.props.info.edition}</span>
			    				<span>Rarity: {this.props.info.rarity}</span>
			    				<span>Mana: {this.props.info.type === 'Monster' ? this.props.info.stats.mana[0] : this.props.info.stats.mana}</span>
			    				<span>Type: {this.props.info.type}</span>
			    				{this.props.info.type === 'Monster' ? <table className='market-cardModal-table'>
			    					<thead>
			    						<tr className='market-cardModal-table-header'>
			    							<th>Level</th>
			    							<th>{this.props.info.attackType === 'attack' ? 'Melee' : this.props.info.attackType === 'ranged' ? 'Ranged' : 'Magic'}</th>
			    							<th>Speed</th>
			    							<th>Health</th>
			    							<th>Armor</th>
			    							<th>Abilities</th>
			    						</tr>
			    					</thead>
			    					<tbody>
			    						{pivot(this.props.info.stats).map(level => {
			    							return (
			    								<tr>
			    									<td className='center'>{level.lvl}</td>
			    									<td className='center'>{level[this.props.info.attackType]}</td>
			    									<td className='center'>{level.speed}</td>
			    									<td className='center'>{level.health}</td>
			    									<td className='center'>{level.armor}</td>
			    									<td className='center'>{level.abilities.join(', ')}</td>
			    								</tr>
			    							);
			    						})}
			    					</tbody>
			    				</table> : this.props.info.type === 'Summoner' ? <div>
			    					<ul>
			    						{Object.keys(this.props.info.stats).map(key => {
			    							if (key !== 'mana' && key !== 'abilities' && this.props.info.stats[key] !== 0) {
			    								var monsters;
			    								if (this.props.info.stats[key] > 0) {
			    									monsters = 'friendly';
			    								} else {
			    									monsters = 'enemy';
			    								}
			    								return (
			    									<li><strong>{this.props.info.stats[key] > 0 ? '+' + this.props.info.stats[key] : this.props.info.stats[key]}</strong> to the <strong>{key === 'attack' ? 'Melee' : key.charAt(0).toUpperCase() + key.substring(1)}</strong> attribute of all {monsters} monsters</li>
			    								);
			    							} else if (key === 'abilities') {
			    								return this.props.info.stats.abilities.map(ability => {
			    									return(
			    										<li><strong>{ability}</strong> ability</li>
			    									);
			    								})
			    							}
			    						})}
			    					</ul>
			    				</div> : ''}
			    			</div>
		    			</div>

		    			: this.state.panel === 'history' ? <div className='market-cardModal-table-container'>
		    				<canvas id="myChart"></canvas>
		    			</div> : ''}
		    			
		    			<div className='market-cardModal-addToCart'>
		    				<span>{this.state.selected.length} {this.props.info.name} Card{this.state.selected.length === 1 ? '' : 's'} Selected, Total BCX: {sumProp(this.state.selected, 'bcx')}, Total: ${sumProp(this.state.selected, 'buy_price').toFixed(3)} USD</span>
	    					<button className='market-cardModal-addToCart-btn' onClick={() => {
	    						let selectedArr = this.state.selected;
	    						let toast = document.getElementById('market-cardModal-toast');
	    						this.setState({selected: []});
	    						this.props.addToCart(selectedArr);
	    						toast.className += ' show';
	    						setTimeout(() => {toast.className = toast.className.replace(' show', '')}, 3000);
	    					}} disabled={this.state.selected.length === 0}>Add to Cart</button>
	    					<button className='market-cardModal-clearSelected-btn' onClick={() => {
	    						this.setState({selected: []});
	    					}} disabled={this.state.selected.length === 0}>Clear All</button>
	    				</div>
	    			</div>
	    		</div>
				<div id='market-cardModal-toast' className='toast successToast'>
					<i className='fas fa-check'></i>Successfully added to cart!
				</div>
				<div id='market-cardModal-tooMany-toast' className='toast failToast'>
					<i className='fas fa-times'></i>You have already selected the limit of 45 cards.
				</div>
				<div id='market-cardModal-required-toast' className='toast failToast'>
					<i className='fas fa-times'></i>Please fill all required fields.
				</div>
	    	</div>
	    );
	}
}

export default MarketCardModal;
