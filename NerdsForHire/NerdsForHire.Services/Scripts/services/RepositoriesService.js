(function () {
    "use strict";

    angular.module("app")
    .factory("RepositoriesService", function ($rootScope, $http) {

        var getRepositories = function () {
            return $http({
                method: "GET",
                url: "/api/GitRepositories",
                headers: { 'Authorization': "Bearer " + $rootScope.user.token }
            });
        };

        return {
            getRepositories: getRepositories
        };
    })
})();