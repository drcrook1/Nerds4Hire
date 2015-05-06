(function () {
    'use strict';

    angular.module('app')
        .controller('HomePageController', ['$scope', '$http', function ($scope, $http) {
            var vm = this;
            vm.Title = "Nerds For Hire";
            vm.GitHubID = "GitHubID";

            $scope.scrapeGitHub = function () {
                alert("Attempting to Scrape!");
                var gitId = document.getElementById("btn_GitHubName").value;
                var data = {
                    "Id": 0,
                    "FirstName": "David",
                    "LastName": "Crook",
                    "Specialty": 0,
                    "TagList": null,
                    "githubId": gitId,
                    "Jobs": [],
                    "Specialty1": null,
                    "NerdSpecialtyRefs": []
                }
                $http.post("/api/Nerd/Scrape/", data);
            };
        }]);
})(); 
