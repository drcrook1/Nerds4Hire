(function () {
    "use strict";

    angular.module("app")
    .factory("RepositoriesService", function ($rootScope, $http) {

        var getRepositories = function () {
            return $http({
                method: "GET",
                url: "https://opendataapi.azure-api.net/api/GitRepositories",
                headers: { 'ocp-apim-subscription-key': '489299e69f5b4ef7a13d03b2e25882cb',
                'Authorization': "Bearer " + $rootScope.user.token }
            });
        };

        return {
            getRepositories: getRepositories
        };
    })
})();