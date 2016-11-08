var app = angular.module('flapperNews', ['ui.router']);

// create a posts factory that can be injected into controllers
app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  };

  // use $http to get posts from api
  o.getAll = function() {
    return $http.get('/posts').success(function(data) {
      // create a deep copy of the returned data
      angular.copy(data, o.posts);
    });
  };

  // method for creating new posts
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data) {
      o.posts.push(data);
    });
  };

  return o;
}]);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        // use resolve from ui-router to ensure posts are loaded
        resolve: {
          postPromise: ['posts', function(posts) {
            return posts.getAll();
          }]
        }
      })

      .state('posts', {
        url: '/posts/{id}', //id is a route parameter
        templateUrl: '/posts.html',
        controller: 'PostsCtrl'
      });
    // where to go if route not found
    $urlRouterProvider.otherwise('home');
  }
]);

app.controller('MainCtrl', [
  '$scope',
  'posts',
  function($scope, posts){
    $scope.test = 'Hello world!';

    $scope.posts = posts.posts;

    $scope.addPost = function() {
      if(!$scope.title || $scope.title === '') {return;}
      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0,
        comments: [
          {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]
      });
      // set title to blank after adding to posts array
      $scope.title = '';
      $scope.link = '';
    };

    $scope.incrementUpvotes = function(post) {
      post.upvotes += 1;
    };
  }
]);

// posts controller
app.controller('PostsCtrl', [
  '$scope',
  '$stateParams',
  'posts',
  function($scope, $stateParams, posts){
    $scope.post = posts.posts[$stateParams.id];

    $scope.addComment = function() {
      if($scope.body === '') { return; }
      $scope.post.comments.push({
        body: $scope.body,
        author: 'user',
        upvotes: 0
      });
      $scope.body = '';
    };
  }
]);
