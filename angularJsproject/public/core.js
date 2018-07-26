var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {
$scope.fomdata='';

$scope.createUser = function() {

$scope.loaded=false;

				$http({
					method: 'POST',
					url: '/api/createAccount',
					data: {user: $scope.fomdata }
				}).then( function(resp){
						$scope.user= resp.data.email;
						console.log($scope.user);
				}, function(data) {
					console.log('APP in maintenence mode: --------------> ' + data);
				});

						$scope.loaded=true;
     }
}
