import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

//Set default route as the user page
//This page will display a user's tag and rank and allow them to:
		//report matches
		//search for matches
		//check into matches
Router.route('/',function(){
	this.render('userTemplate')
})

//creation of user template
//initalize rank and tag to null if there is not already a session
Template.userTemplate.onCreated(function userTemplateOnCreated(){
	this.playerTag = new ReactiveVar(''); //string of users ingame tag
	this.playerRank = new ReactiveVar(0); //int of users rank
	this.playerOpponent = new ReactiveVar('');
	this.playerID = new ReactiveVar('');
	if (sessionStorage.getItem('tag')){
		this.playerTag.set(sessionStorage.getItem('tag'));
		this.playerRank.set(sessionStorage.getItem('rank'));
		this.playerOpponent.set(sessionStorage.getItem('opponent'));
		//handle updates for player opponent
		this.playerID.set(sessionStorage.getItem('id'));
	}//session exists, update tag and rank
	else {
		this.playerTag.set(null);
		this.playerRank.set(null);
		this.playerOpponent.set(null);
		this.playerID.set(null);
	}//session doesn't exist
})

//helper functions for user template
Template.userTemplate.helpers({
	//displays what the user choice button says
	userChoiceButton(){
		if (Template.instance().playerTag.get() == null){
			return 'Sign In';
		}
		else {
			return 'Change User';
		}
	},
	//displays the tag of the user, or a defaukt message if not signed in
	displayTag(){
		//return Template.instance().playerTag.get();
		if (Template.instance().playerTag.get() == null){
			return 'Click the Sign In Button to view and report matches';
		}
		else{
			return Template.instance().playerTag.get();
		}
	},
	//displays the rank of the user, or nothing if not signed in
	rank(){
		var playerTag = Template.instance().playerTag.get();
		if (playerTag == null){
			return null;
		}
		return 'Rank = ' + Template.instance().playerRank.get();
	},
	//populates the option select field in the modal dialog
	options(){
		return players =  Players.find().fetch();
	},
	Opponent(){
		var temp =  (Players.findOne({tag : Template.instance().playerTag.get()}).opponent)
		if (temp == null){
			//enabled button if there if not in queue
			document.getElementById('findButton').disabled = false;
			return 'Search for a Match';
		}
		else if (temp == '-1'){
			//disable button if searching for a match
			document.getElementById('findButton').disabled = true;
			return 'Waiting for Match'
		}
		else {
			//disabled button if a match is found
			document.getElementById('findButton').disabled = true;
			return temp
		}
	},
})

//evens for user template
Template.userTemplate.events({
	//display modal on sign in button click
	'click #userButton' : function(event, template){
		var modal = document.getElementById('myModal');
		modal.style.display = "block";
		return;
	},
	//close modal
	'click #closeButton': function(event, template){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
	},
	//update values when a user is chosen from the list
	'submit #playerChooseForm' : function(event, template){
		event.preventDefault();
    	//choose tag from list of players
    	tag = event.target.tag.value;
    	myPlayer = Players.findOne({tag: tag});
    	template.handle = myPlayer;
    	var rank = myPlayer.rank;
    	var id = myPlayer._id;
    	template.playerTag.set(tag);
    	template.playerRank.set(rank);
    	template.playerID.set(id);
    	sessionStorage.setItem('id',id);
    	sessionStorage.setItem('tag',tag);
    	sessionStorage.setItem('rank',rank);
    	var modal = document.getElementById('myModal');
    	modal.style.display = "none";

	},
	//close modal if clicks outside
	'click' : function(event){
		var modal = document.getElementById('myModal');
		if (event.target == modal) {
       		modal.style.display = "none";
    	}
	},
	'click #findButton' : function(event, template){
		console.log(template.playerID.get())
		if (Players.findOne({_id : template.playerID.get()}).opponent != null){
			event.target.disabled = true;
			return;
		}
		Players.update(
			{_id : template.playerID.get()},
			{
				tag : template.playerTag.get(),
				rank : template.playerRank.get(),
				opponent : '-1'
			}
		)
		template.playerOpponent.set('-1');
		sessionStorage.setItem('opponent','-1');
		event.target.disabled = true;
	},
})


//route for the admin page which controls adding players and starting the tournament
Router.route('/admin');



Template.admin.onCreated(function adminOnCreated(){
})

//admin template helper functions
Template.admin.helpers({
	//display list of players
	playersList(){
    	return Players.find().fetch();
	},
})
//admin template event handler
Template.admin.events({
	//add player modal handler
	'click #addPlayer' : function(event, template){
		var modal = document.getElementById('myModal');
		modal.style.display = "block";
		return;
	},
	//close modal
	'click #closeButton': function(event, template){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
	},

	//add player confirm button
	//handles form submit event
  	'submit #addPlayerForm': function(event, template ){
    	event.preventDefault();
    	// add in player to the list of players
    	const tag = event.target.tag.value;
    	Players.insert({
    		tag: tag,
    		rank: 0,
    		opponent: null,
    	});
    	event.target.name.value = '';
    	event.target.tag.value = '';
    	var modal = document.getElementById('myModal');
    	modal.style.display = "none";

    },
    //close modal
    'click' : function(event){
		var modal = document.getElementById('myModal');
		if (event.target == modal) {
       		modal.style.display = "none";
    	}

	}
})

