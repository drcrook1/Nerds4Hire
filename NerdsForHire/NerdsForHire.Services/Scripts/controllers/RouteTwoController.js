(function () {
    'use strict';

    angular.module('app')
        .controller('RouteTwoController', ['$scope', '$http', function ($scope, $http) {
            var vm = this;
            vm.Title = "FSharp Web Kit";
            vm.GitHubID = "GitHubID";
            vm.Repositories = [{}, {}];
            $http.get("api/GitRepositories").success(function (data) {
                vm.Repositories = data;
            });
        }]);
})();
