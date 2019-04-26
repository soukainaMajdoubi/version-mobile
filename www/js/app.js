// Ionic Starter App

// Controllers
const TodoCtrl = function(
  
  $scope,
  $http,
  $ionicModal,
  $state,
  $ionicSideMenuDelegate
) {

  const token = window.localStorage.getItem('token')
    console.log(token)
    if (!token) {
      return $state.go('/login')
    }
    const httpConfig = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
  // Create and load the Modal
  $ionicModal.fromTemplateUrl(
    'new-task.html',
    function(modal) {
      $scope.taskModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up'
    }
  );

 


  const loadLists = async function() {
    try {
      const res = await $http.get('/lists', httpConfig)
      const {data, error, success} = res.data
      if (success) {
        $scope.lists = data
      } else {
        $scope.error = error
      }
    } catch (err) {
      $scope.error = 'Erreur'
    }
    
  };
  const loadtasks = async function() {
    try {
      console.log($scope.activeList._id )
      const res = await $http.get('/tasks/' + $scope.activeList._id ,httpConfig)
      const {data, error, success} = res.data
      if (success) {
        $scope.tasks = data
      } else {
        $scope.error = error
      }
    } catch (err) {
      $scope.error = 'Erreur'
    }
    
  }


  const addList = async function(projectTitle) {
    $scope.newListName = projectTitle
    try {
      const res = await $http.post('/lists', {name:$scope.newListName}, httpConfig)
      console.log(res.data)


      const {data, error, success} = res.data
      if (success) {
        console.log(projectTitle)
        loadLists()
      } else {
        $scope.error = error
      }
    } catch (err) {
      $scope.error = 'Erreur'
    }
};

  $scope.newProject = () => {
    loadLists()

    const projectTitle = prompt('Project name');
    
    if (projectTitle) {

      addList(projectTitle);
    }
  };
  
  $scope.selectProject = list => {
    $scope.activeList = list;
    loadLists();
    $ionicSideMenuDelegate.toggleLeft(false);
  };
  
  $scope.createTask = async function(task) {
    
    try {
     
     const res = await $http.post('/tasks', {
      listId:$scope.activeList._id,
      name: task.name,
      done: false},httpConfig)
     const {data, error, success} = res.data
      if (success) {
        task.name = '';
        loadtasks()
      } else {
           $scope.error = error
      }
    } catch (err) {
        $scope.error = 'Erreur'
    }
    $scope.taskModal.hide();
  };
 


  // ouvrir un nouveau task model
  $scope.newTask = function() {
    loadtasks()
    $scope.taskModal.show();
  };

  // fermer le nouveau task modal
  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };

  $scope.toggleProjects = () => {
    $ionicSideMenuDelegate.toggleLeft();
  };
//supprimer les taches par son id
  $scope.deleteTask = async function(id){
    try {
      const res = await $http.delete('/tasks/'+ id, httpConfig)
      const {data, error, success} = res.data
      if (success) {
        loadtasks()
      } else {
        $scope.error = error
      }
    } catch (err) {
      $scope.error = 'Erreur'
    }
  }
  
  $scope.disconnect = function(){
    window.localStorage.setItem('token','')
    $state.go('login');
     
  };

  
};
//controlleur de connexion 
const LoginCtrl = function($scope, $state, $http) {
  $scope.user = {}
  $scope.error = ''
  $scope.login = async  function() {
    console.log($scope.user)
    try {
      const res = await $http.post('/auth', $scope.user)
      
      const {data, error, success} = res.data
      if (success) {
        window.localStorage.setItem('token', data.token)
        $state.go('todo');
        
      } else {
        $scope.error = error
      }
    } catch (err) {
      $scope.error = 'Erreur'
    }
  };

  $scope.signup = () => {
    $state.go('signup');
  };
};
//controlleur d'authentification 
const SignupCtrl = function($scope, $state, $http) {
  $scope.user = {};

  
  $scope.signup = () => {
   
      $http
        .post('/register', $scope.user)
        .then(data => {
          console.log(data);
          if (data.status === 200) $state.go('login');
          
        })
        .catch(err => {
          console.log(err);
        });
    } 
    
  

  $scope.back = () => {
    $state.go('login');
  };
};
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('todo', ['ionic'])
  .controller('TodoCtrl', TodoCtrl)
  .controller('LoginCtrl', LoginCtrl)
  .controller('SignupCtrl', SignupCtrl)
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        cache: false,
        controller: 'LoginCtrl'
      })
      .state('todo', {
        url: '/todos',
        templateUrl: 'templates/todos.html',
        cache: false,
        controller: 'TodoCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'SignupCtrl'
      });
    $urlRouterProvider.otherwise('/login');
  })

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs).
      // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
      // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
      // useful especially with forms, though we would prefer giving the user a little more room
      // to interact with the app.
      if (window.cordova && window.Keyboard) {
        window.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }
    });
  });
