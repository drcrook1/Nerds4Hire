(function () {
    'use strict';
    angular.module('app', ['ui.router'])
    .factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    .config(configFunction);

    function configFunction($stateProvider, $urlRouterProvider, $httpProvider) {
        //sets default route
        $urlRouterProvider.otherwise("/one");
        //set what routes we provide.  This can get very long.
        $stateProvider.
            state('routeOne', {
                url: "/one",
                templateUrl: "scripts/views/routeOne.html"
            })
            .state('routeTwo', {
                url: "/two",
                templateUrl: "scripts/views/routeTwo.html"
            })
            .state('routeThree', {
                url: "/three",
                templateUrl: "scripts/views/routeThree.html"
            })
            .state('login', {
                url: "/login",
                templateUrl: "scripts/views/login.html"
            });
        //any time we get a 401 response, this function will run.
        $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
    }
})();