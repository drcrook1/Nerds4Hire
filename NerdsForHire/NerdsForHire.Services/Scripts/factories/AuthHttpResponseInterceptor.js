//function AuthHttpResponseInterceptor($q, $location) {
//    $rootscope.$on('$routeChangeError', authErrorHandler);

//    function authErrorHandler(event, current, previous, rejection){
//        console.log(JSON.stringify(rejection));
//    }
//}

var AuthHttpResponseInterceptor = function ($q, $injector) {
    return {
        response: function (response) {
            if (response.status === 401) {
                console.log("Response 401");
            }
            return response || $q.when(response);
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                alert("UNAUTHORIZED!");
                console.log("Response Error 401", rejection);
                var $state = $injector.get("$state");
                $state.transitionTo('login');
            }
            return $q.reject(rejection);
        }
    }
}

AuthHttpResponseInterceptor.$inject = ['$q', '$injector'];