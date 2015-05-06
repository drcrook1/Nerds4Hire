(function () {
    'use strict';
    angular.module('app', ['ui.router'])
    .factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    .run(["$rootScope", function ($rootScope) {
        // Scope Globals
        // ----------------------------------- 
        $rootScope.app = {
            name: 'Nerds For Hire',
            description: 'Hire Some Nerds!',
            api: {
                base: 'http://localhost:56549/api',
                requiresAuth: false
            }
        };
        $rootScope.user = {
            userName: '',
            email: '',
            isLoggedIn: false
        };
    }])
    .config(configFunction);

    function configFunction($stateProvider, $urlRouterProvider, $httpProvider) {
        //sets default route
        $urlRouterProvider.otherwise("/one");
        //set what routes we provide.  This can get very long.
        $stateProvider.
            state('login', {
                url: "/login",
                templateUrl: "scripts/views/login.html"
            })
            .state('routeTwo', {
                url: "/two",
                templateUrl: "scripts/views/routeTwo.html"
            })
            .state('routeThree', {
                url: "/three",
                templateUrl: "scripts/views/routeThree.html"
            });
        //any time we get a 401 response, this function will run.
        $httpProvider.interceptors.push('AuthHttpResponseInterceptor');

    }
})();