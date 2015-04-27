(function () {
    'use strict';
    angular.module('app', ['ui.router'])
    .factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    .config(configFunction);

    function configFunction($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise("/one");
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

        $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
    }
})();