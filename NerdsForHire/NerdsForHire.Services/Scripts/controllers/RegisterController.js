//var RegisterController = function ($scope, $location, LoginFactory) {
//    $scope.registerForm = {
//        emailAddress: '',
//        password: '',
//        confirmPassword: ''
//    };

//    $scope.register = function () {
//        var result = LoginFactory.register($scope.registerForm.emailAddress, $scope.registerForm.password, $scope.registerForm.confirmPassword);
//        result.then(function (result) {
//            if (result.success) {
//                $location.path('/routeOne');                
//            } else {
//                $scope.registerForm.registrationFailure = true;
//            }
//        });
//    }
//}

//RegisterController.$inject = ['$scope', '$location', 'LoginFactory'];