//var LoginFactory = function ($http, $q) {
//    return {
//        login: function (emailAddress, password, rememberMe) {

//            var deferredObject = $q.defer();

//            $http.post(
//                '/api/Account/Login',
//                {
//                    Email: emailAddress,
//                    Password: password,
//                    RememberMe: rememberMe
//                }
//            ).
//            success(function (data) {
//                if (data == "True") {
//                    deferredObject.resolve({ success: true });
//                } else {
//                    deferredObject.resolve({ success: false });
//                }
//            }).
//            error(function () {
//                deferredObject.resolve({ success: false });
//            });

//            return deferredObject.promise;
//        }
//    };
//}

//LoginFactory.$inject = ['$http', '$q'];