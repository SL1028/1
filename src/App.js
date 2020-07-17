import React from 'react';
import logo from './logo.svg';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Market from './Components/Market/Market';
import Packs from './Components/Packs/Packs';
import BattleChain from './Components/BattleChain/BattleChain';
import Scanner from './Components/Scanner/Scanner';
import Collection from './Components/Collection/Collection';
import $ from 'jquery';

function isLoggedIn() {
  if(localStorage.getItem('username')) {
    return true;
  } else {
    return false;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'market',
      username: localStorage.getItem('username') || '',
      loggedIn: isLoggedIn(),
      DECbalance: null
    };
    this.renderPage = this.renderPage.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.login = this.login.bind(this);
  }

  updatePage(newPage) {
    this.setState({
      page: newPage
    });
  }

  login(username) {
    var loggedIn;
    if (username === '') {
      loggedIn = false;
    } else {
      loggedIn = true;
    }
    this.setState({
      username: username,
      loggedIn: loggedIn
    });
  }

  renderPage(page) {
    if (page === 'market') {
      return <Market updateBalance={this.updateBalance}/> ;
    } else if (page === 'collection') {
      return <Collection loggedIn={this.state.loggedIn}/>
    } else if (page === 'packs') {
      return <Packs />
    } else if (page === 'battlechain') {
      return <BattleChain />
    } else if (page === 'scanner') {
      return <Scanner />
    }
  }

  componentDidMount() {
    if (this.state.loggedIn) {
      $.ajax({
        type: 'GET',
        url: 'https://game-api.splinterlands.com/players/balances?username=' + this.state.username,
        jsonpCallback: 'testing',
        dataType: 'json',
        success: function(balances) {
          let DECbalance = 0;
          for (let i = 0; i < balances.length; i++) {
            if (balances[i].token === 'DEC') {
              DECbalance = balances[i].balance;
            }
          }
          this.setState({DECbalance: DECbalance});
        }.bind(this),
        error: function(e) {
          console.log('There was an error getting the DEC balance');
        }
      });
    }
  }

  componentDidUpdate(prevState) {
    if (this.state.loggedIn !== prevState.loggedIn) {
      if (this.state.loggedIn) {
        $.ajax({
          type: 'GET',
          url: 'https://game-api.splinterlands.com/players/balances?username=' + this.state.username,
          jsonpCallback: 'testing',
          dataType: 'json',
          success: function(balances) {
            let DECbalance = 0;
            for (let i = 0; i < balances.length; i++) {
              if (balances[i].token === 'DEC') {
                DECbalance = balances[i].balance;
              }
            }
            this.setState({DECbalance: DECbalance});
          }.bind(this),
          error: function(e) {
            console.log('There was an error getting the DEC balance');
          }
        });
      }
    }
  }

  updateBalance() {
    if (this.state.loggedIn) {
      console.log('beginning DEC' + this.state.DECbalance);
      setTimeout(() => {$.ajax({
        type: 'GET',
        url: 'https://game-api.splinterlands.com/players/balances?username=' + this.state.username,
        jsonpCallback: 'testing',
        dataType: 'json',
        success: function(balances) {
          let DECbalance = 0;
          for (let i = 0; i < balances.length; i++) {
            if (balances[i].token === 'DEC') {
              console.log('got new DEC' + balances[i].balance);
              DECbalance = balances[i].balance;
            }
          }
          this.setState({DECbalance: DECbalance});
        }.bind(this),
        error: function(e) {
          console.log('There was an error getting the DEC balance');
        }
      })}, 10000);
    }
}

  render() {
    return ( 
      <div className = "App" >
        <Navbar active = {this.state.page} updatePage={this.updatePage} login={this.login} loggedIn={this.state.loggedIn} balance={this.state.DECbalance}/>
        {this.renderPage(this.state.page)}
      </div>
    );
  }
}

export default App;
