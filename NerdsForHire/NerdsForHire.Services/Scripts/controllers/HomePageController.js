"use strict";
(function () {
    console.log("HomePageController loaded");
    angular.module('app')
        .controller('HomePageController', thingsandstuff);

    function thingsandstuff() {
        var vm          = this;
            vm.Title    = "FSharp Web Kit";
            vm.GitHubID = "GitHubID"; //TODO: set this w/ a Get call to retrieve GitHub ID from user

        // Retrieves GitHub ID from screen scraper
        this.GetGitHubID = function() {
            $http.get("/api/trivia") //TODO: Replace w/ call to screen scraper to return ID
                .success(function(data, status, headers, config) {
                    vm.GitHubID = data.GitHubID;
              }).error(function(data, status, headers, config) {
                    vm.GitHubID = "Oops... something went wrong";
                });
        }

    }
    // Required to have all WinJS controls be active on the page.
    // I just left it here because I know that this controller gets called each time the app loadas
    WinJS.UI.processAll();
})();

  
