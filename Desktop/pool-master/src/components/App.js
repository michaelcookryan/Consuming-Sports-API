import React from 'react'
import axios from 'axios'
import base64 from 'base-64'
import utf8 from 'utf8'
import '../styles/App.css'
import Picks from '../players.json'
import Player from './Player'
import logo from '../assets/images/Biohazard_symbol.png'

const myPwd = 'XXXXX'
const myAPI = 'XXXXX'
const apiToken = utf8.encode(`${myAPI}:${myPwd}`) 
const encoded = base64.encode(apiToken)
const AuthStr = 'Basic ' + encoded


class App extends React.Component{

  state = {
         
    allTeams: [],
    players: [],
    sortedList: []
    
  }
  
  
  
 findTeam = searchedId => {
    let found = this.state.allTeams.find(team => team.team.ID === searchedId)
    let stats = found.stats
    let team = found.team

   return {
     name: team.City + " " + team.Name,
     record: {
       wins: parseInt(stats.Wins['#text']),
       losses: parseInt(stats.Losses['#text']),
       ties: parseInt(stats.Ties['#text']),
     }
     
   }
  }

  descendingOrder = (list) => {

    return list.sort((a, b) => { return (b.record.wins + b.record.ties) - (a.record.wins + a.record.ties) })
    
  }



  totalsForStandings = (team) => {
    let total = 0
    total = parseInt(team.record.wins, 10) + parseFloat((team.record.ties / 2), 10)
    return total 
  }

  currentDateTime = () => { 
    let today = new Date()
    return (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  }


  standings = (array) => {
    
    let currentStandings = []

      array.forEach(player => {

        let teamsTotal = 0

        player.teams.forEach(team => {

            teamsTotal = teamsTotal + this.totalsForStandings(team)

          })

          let playerTotal = {

            id: player.id,
            total: teamsTotal
            
          }
            currentStandings.push(playerTotal)
      })

    let sorted = currentStandings.sort((a, b) => { return b.total - a.total })

      return sorted

  }



  componentDidMount() {
       
    axios.get('https://api.mysportsfeeds.com/v1.0/pull/nfl/2019-regular/overall_team_standings.json', { headers: { 'Authorization': AuthStr } }).then(response => {
    
      this.setState({

        allTeams: response.data.overallteamstandings.teamstandingsentry,
        
      }, () => {
        
        const playerList = []
          
        Picks.forEach(player => {
          
          const draftedTeam = []

          player.teamsList.forEach(team => {

            draftedTeam.push(this.findTeam(team))
                
          })
          
          playerList.push({ id: player.id, teams: draftedTeam })
      
        })
          
        this.setState({

          players: playerList,
          sortedList: this.standings(playerList)

        })

      })
    }).catch(err => { console.log(err) })

  }



  render() {
   
    return (
      
      <div className="App">
        <header>
          <div className="main">
            <img src={logo}/>
            <h1 className="main__title">Plague Pool</h1>
            <h3 className="main__subtitle">&mdash; 2019 &mdash;</h3>
          </div>
        </header>
        
        <div className="overall-section">
          <h3 className="overall-title">Standings as of {this.currentDateTime()}</h3>
        <ol className="league-standings">
          {this.state.sortedList.map(player => {

            return <li className="league-standings__player-total">

              <div className="player-standing">
                <h3 className="player-standing__name">{player.id}</h3>
                <h3 className="player-standing__total">{player.total}</h3>
              </div>             

            </li>

          }
          )}
        </ol>
        </div>
        <section>
          <h2 className="players-title">Player's Rosters</h2>
        <div className="players-team-records">

          {this.state.players.map(player => {
                                      
            return <div id={player.id} className="players-team-records__player-group">

              <Player name={player.id} allTeams={player.teams} total={this.totalsForStandings} descendingOrder={this.descendingOrder} key={player.id} />

            </div>
            
          }
          )}

        </div>
        </section>
        <footer>
          <p>This site is for personal use only and is in no way affilated with the National Football League or its' teams.<br/>That being said, please don't piss in our cereal for using your registered logos. Our little site is just a way for us to enjoy the season.<br/>Cheers!</p>
        </footer>
      </div>
    )
  }

}

export default App;
