//Set any enviornment variables with the dotenv package
require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");

//Create spotify object for node-spotify-api
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);

//node_commands object will execute commands based on command written
var node_commands = {
    "concert-this": function(artist){
        //Use axios to get bandsintown data
        axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp").then(function(response){
            response.data.forEach(function(value){
                console.log("Venue Name: " + value.venue.name);
                if (value.venue.region != ''){
                    console.log("Venue Location: " + value.venue.city + ", " + value.venue.region + ", "+value.venue.country);
                }
                else{
                    console.log("Venue Location: " + value.venue.city + ", " + value.venue.country);
                }
                console.log(moment(value.datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY"));
                console.log("------------------------------------------------------");
            });
        });
    },

    "spotify-this-song": function(song){
        if (song != ''){
            spotify.search({type: "track", query: song, limit: 1}, function(err, data){
                if (err) {
                    console.log("Error occurred: " + err);
                }
                else{
                    var artists = [];
                    data.tracks.items[0].artists.forEach(function(value){
                        artists.push(value.name);
                    });
                    console.log("Artist(s): " + artists.join(", "));
                    console.log("Song: " + data.tracks.items[0].name);
                    console.log("Preview: " + data.tracks.items[0].preview_url);
                    console.log("Album: " + data.tracks.items[0].album.name);

                }
            })
        }
        else{ //Search for "The Sign" if nothing is inputted
            var found = false;
            spotify.search({type: "track", query: "The Sign "}, function(err, data){
                if (err) {
                    console.log("Error occurred: " + err);
                }
                else{
                    data.tracks.items.forEach(function(value){
                        var artists = [];
                        value.artists.forEach(function(artist){
                            artists.push(artist.name);
                        });
                        if ((artists.join(", ")).toLowerCase() == "ace of base" & !found){
                            console.log("Artist(s): " + artists.join(" "));
                            console.log("Song: " + value.name);
                            console.log("Preview: " + value.preview_url);
                            console.log("Album: " + value.album.name);
                            found = true;
                        }
                    });
                }
            });
        }
    },

    "movie-this": function(movie){
        var mov;
        if (movie != ''){
            mov = movie;
        }
        else{ //Default set to "Mr. Nobody"
            mov = "Mr. Nobody";
        }
        axios.get("http://www.omdbapi.com/?t=" + mov + "&y=&plot=short&apikey=" + keys.omdb.key).then(
            function(response) {
                var output = response.data;
                console.log("Movie: " + output.Title);
                console.log("Year: " + output.Year);
                console.log("IMDB Rating: " + output.imdbRating);
                console.log("Rotton Tomatoes Rating: " + output.Ratings[1].Value);
                console.log("Country: " + output.Country);
                console.log("Plot: " + output.Plot);
                console.log("Actors: " + output.Actors);

            }
        );
    },

    "do-what-it-says": function(){
        fs.readFile("random.txt", "utf8", function(error, data) {
            // If the code experiences any errors it will log the error to the console.
            if (error) {
              return console.log(error);
            }
            console.log(data);
            // Then split it by commas (to make it more readable)
            var dataArr = data.split(",");
          
            //Executes spotify-this based on txt file
            node_commands[dataArr[0]](dataArr[1]);
          
        });
    }
}

var command = process.argv[2];

if (command != "do-what-it-says"){
    var user_input = process.argv;
    user_input.splice(0, 3).join(' ');
    node_commands[command](user_input);
}
else{
    node_commands[command]();
}

