var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {

$scope.createUser = function() {



$scope.loaded=false;
				$http.get('/api/createAccount')
						.success( function(data){
						$scope.user= data;
						})
						.error(function(data) {
								console.log('Error: --------------> ' + data);
						});

						console.log('data is ====> '+data);
						$scope.loaded=true;
     }
}
