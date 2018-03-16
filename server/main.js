import { Meteor } from 'meteor/meteor';
import '../lib/players.js'

Meteor.startup(() => {
  // code to run on server at startup
});


//function that handles when a player makes a change 
Players.after.update(){
	//go through list of players a create a dict with all of them
}



