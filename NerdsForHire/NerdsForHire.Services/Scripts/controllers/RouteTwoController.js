(function () {
    'use strict';

    angular.module('app')
        .controller('RouteTwoController', ['$scope', 'RepositoriesService', function ($scope, RepositoriesService) {
            var vm = this;
            vm.Title = "Nerds 4 Hire";
            vm.GitHubID = "GitHubID";
            vm.Repositories = [{}, {}];
            RepositoriesService.getRepositories().success(function (data) {
                vm.Repositories = data;
            });
        }]);
})();
