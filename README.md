
cardgame
========

to install bcrypt:

	npm install bcrypt --openssl-root="C:\Users\Mack Yi\openssl"

	** fixed now by moving openssl to C:\OpenSSL-Win64
=======
cardgame2
=========

1/24/13
	added 'play' route and play.jade
	figured out how to display games using looping logic in jade and querying database
		problems: 
			games shouldn't really be permanent, they multiplied pretty quickly
			have to save games all the time in order for this to work
		solutions:
			have "global"-ish variable that stores games, among other things, temporarily
			should this be saved into the database regularly, maybe using setinterval? not sure, don't see why for now
	next time:
		implement global-ish variable
		make play.jade useable, but not pretty
		figure out socket.io configuration to go to specific games using game:gameid where the id can be extracted - but only from the database? 
			solution:
				store every game in the database upon creation with its name, so that, if nothing else, it can at least be queried around. 
				this seems sketchy
				how about using an id on the global-ish variable? this seems sketch but cool. not sure how it would be implemented. not sure if it should be the same as the one used in the database