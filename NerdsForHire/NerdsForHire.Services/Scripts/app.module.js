(function () {
    'use strict';
    angular.module('app', ['ui.router'])
    .factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    //.config(configFunction);

    function configFunction($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise("/one");
        $stateProvider.
            state('routeOne', {
                url: "/one",
                templateUrl: "scripts/views/routeOne.html"
            })
            .state('routeTwo', {
                url: "/two",
                templateUrl: "routesDemo/Two?donuts=3"
            })
            .state('routeThree', {
                url: "/three",
                templateUrl: "routesDemo/Three"
            })
            .state('login', {
                url: "/login",
                templateUrl: "routesDemo/Login"
            });

        $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
    }
})();