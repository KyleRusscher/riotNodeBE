# riotNodeBE
refactored back end for sidekick.gg in node

riotNodeBE crawls over riot api to find as many players as possible and analyzing their matches. This now runs asynchrnously with both API requests and processing of data.  When the rate limit is met, all collected with be interted into DB to reduce downtime.  To alter what data is collected, the parseMatchData method inside the GetRequests class can be modified to fit your needs. To use simply configure your own database connection in the DataBase class and put your own api key into the headers in the sendGet method. Both production and development keys will work. Rate limiting will cause a timeout once met and the application will continue upon completion.
