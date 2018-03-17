import { Meteor } from 'meteor/meteor';
import '../lib/players.js'



var queue = {};//this object will store players queing for matches
							//the key is an int with the player's rank
							//the value is all the players at that rank
Meteor.startup(() => {
  // code to run on server at startup
});


//function that handles when a player makes a change 
Players.after.update(function(userId, doc){
//go through list of players a create a dict with all of them
	console.log(doc.tag);
	//check if person is being added to queue
	if (doc.opponent == "-1"){
		console.log("HERER");
		if (queue[doc.rank]){
			var waitingAtRank = queue[doc.rank];
			waitingAtRank.push(doc.tag);
			queue[doc.rank] = waitingAtRank;
		}
		else {
			var waitingAtRank = []
			waitingAtRank.push(doc.tag);
			queue[doc.rank] = waitingAtRank;
		}
	}
	//if player is rentering wait state
	else if (doc.opponent == null){
		return;
	}
	//some other change happened
	else {
		return
	}
	//list of players waiting at rank
	var waitingAtRank = queue[doc.rank]
	console.log(waitingAtRank);
	for (var i = 0; i < waitingAtRank.length; i++){
		//TODO: check if players have already played
		if (waitingAtRank[i] != doc.tag){
			//players should be matched up
			doc.opponent = waitingAtRank[i];
			Players.update(
				{tag: waitingAtRank[i]},
				{
					tag : waitingAtRank[i],
					rank : doc.rank,
					opponent : doc.tag
				}

			);
			waitingAtRank.splice(i,1);
			Players.update(
				{tag: doc.tag},
				{
					tag : doc.tag,
					rank : doc.rank,
					opponent : doc.opponent
				}

			);
		}
	}

})



