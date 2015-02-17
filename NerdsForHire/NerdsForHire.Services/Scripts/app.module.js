(function () {
    'use strict';
    angular.module('app', ['ui.router'])
    .controller('HomePageController', HomePageController)
    .factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    .config(configFunction);

    //.controller('LoginController', LoginController)
    //.controller('RegisterController', RegisterController)
    //.factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor)
    //.factory('LoginFactory', LoginFactory)
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
        //alert(JSON.stringify($httpProvider))
        $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
    }
})();

//var FSharpWebKit = angular.module('FSharpWebKit', ['ui.router']);

////Controllers
//FSharpWebKit.controller('HomePageController', HomePageController);
//FSharpWebKit.controller('LoginController', LoginController);
//FSharpWebKit.controller('RegisterController', RegisterController);

////Factories
//FSharpWebKit.factory('AuthHttpResponseInterceptor', AuthHttpResponseInterceptor);
//FSharpWebKit.factory('LoginFactory', LoginFactory);

////Routes
//var configFunction = function ($stateProvider, $urlRouterProvider) {
//    $stateProvider.
//        state('routeOne', {
//            url: "/one",
//            templateUrl: "Views/RoutesDemo/One.cshtml"
//        })
//        .state('routeTwo', {
//            url: "/two",
//            templateUrl: "Views/RoutesDemo/Two.cshtml"
//        })
//        .state('routeThree', {
//            url: '/three',
//            templateUrl: "Views/RoutesDemo/Three.cshtml"
//        })
//        .state('/login', {
//            url: '/Login',
//            templateUrl: "Views/Account/login.html",
//            controller: LoginController
//        })
//        .state('/register', {
//            url: "/register",
//            templateUrl: 'partials/register.html',
//            controller: RegisterController
//        });
//    ;
//    $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
//}

//configFunction.$inject = ['$stateProvider', '$urlRouterProvider'];

//FSharpWebKit.config(configFunction);
