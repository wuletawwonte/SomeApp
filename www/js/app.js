// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var lyricsApp = angular.module('starter', ['ionic','ngCordova']);
var db = null;

lyricsApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

lyricsApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  
//     --------------------------------             //

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  })







//           ------------------------              //

  .state('pages', {
    url: '/page',
    // abstract: true,
    templateUrl: 'templates/splash.html',
    controller: 'HomeController'
  })

  .state('app.artists', {
    url: '/artists',
    views: {
        'menuContent': {
          templateUrl: 'templates/artists.html',      
          controller: 'ArtistsController'        
        }
    }
  })

  .state('app.songs', {
    url: '/artists/:albumId',
    views: {
        'menuContent': {
          templateUrl: 'templates/songs.html',      
          controller: 'SongsController'        
        }
    }
  })

  .state('app.content', {
    url: '/artists/:albumId/:songId',
    views: {
        'menuContent': {
          templateUrl: 'templates/lyrics.html',      
          controller: 'ContentController'        
        }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent' : {
        templateUrl: 'templates/about.html',
      }
    }
  })

  .state('loading', {
    url: '/loading',
    templateUrl: 'templates/loading.html',      
    controller: 'LoadingController'
  })

  $urlRouterProvider.otherwise('/loading');  
});

lyricsApp.controller('ContentController', function($scope, $state, $cordovaSQLite) {
  $scope.songContent = null;
  $scope.songId = $state.params.songId;
  var qry = "SELECT song_id, song_title, song_content FROM songs WHERE song_id == ?";
  $cordovaSQLite.execute(db, qry, [$scope.songId]).then(function(r) {
    if(r.rows.length == 1){
      $scope.songContent = r.rows[0].song_content;
    } 
  }, function(error) {
    console.log(error);
  });
});

lyricsApp.controller('LoadingController', function($scope, $ionicLoading, $ionicPlatform, $cordovaSQLite, $location, $ionicHistory){
  
  $ionicHistory.nextViewOptions({
    disableAnimate: true,
    disableBack: true
  });

  $ionicPlatform.ready(function() {
    $ionicLoading.show({ template: "Loading..." });
    if(window.cordova){
      window.plugins.sqlDB.copy("songs.db", function(){
        db = $cordovaSQLite.openDB("songs.db");
        $ionicLoading.hide();
        $location.path("/page");
      }, function(error) {
        db = $cordovaSQLite.openDB("songs.db");
        $ionicLoading.hide();
        $location.path("/page");
      });
    } else {
      db = openDatabase("websql.db", "1.0", "songs", 2 * 1024 * 1024);
      db.transaction(function(tx) {
        tx.executeSql("DROP TABLE IF EXISTS singers");
        tx.executeSql("DROP TABLE IF EXISTS albums");
        tx.executeSql("DROP TABLE IF EXISTS songs"); 
        tx.executeSql("CREATE TABLE IF NOT EXISTS singers(singer_id integer primary key, singer_name text)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS albums(album_id integer primary key, album_title text, which_singer integer)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS songs(song_id integer primary key, song_title text, song_content text, which_album integer)");
        tx.executeSql("INSERT INTO singers(singer_name) VALUES (?)", ["Endale Woldegiorgis"]);
        tx.executeSql("INSERT INTO singers(singer_name) VALUES (?)", ["Dawit Getachew"]);
        tx.executeSql("INSERT INTO singers(singer_name) VALUES (?)", ["Lili Tilahun"]);
        tx.executeSql("INSERT INTO albums(album_title, which_singer) VALUES (?, ?)", ["Yewengel Arbegna", 1]);
        tx.executeSql("INSERT INTO albums(album_title, which_singer) VALUES (?, ?)", ["Metsnagnaye", 1]);
        tx.executeSql("INSERT INTO albums(album_title, which_singer) VALUES (?, ?)", ["Yibezhegnal", 1]);
        tx.executeSql("INSERT INTO albums(album_title, which_singer) VALUES (?, ?)", ["Ewedihalew", 2]);
        tx.executeSql("INSERT INTO albums(album_title, which_singer) VALUES (?, ?)", ["Bemihiretu", 2]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Biswal Misganaye", "Amazing Grace how sweet the sound", 1]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Arbegna Negn","T'was Grace that taught my heart to fear", 1]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Kidisina","Through many dangers, toils and snares", 1]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Tilik Neh","God is fighting for us", 4]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Keadman Bashager","Yes, He has overcome", 4]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Zelalem Ayitefam","God is fighting for us", 4]);
        tx.executeSql("INSERT INTO songs(song_title, song_content, which_album) VALUES (?,?,?)", ["Biswal Misganaye","We will not be shaken", 5]);
      });
      $ionicLoading.hide();
      $location.path("/page");
    }
  });

});

lyricsApp.controller('HomeController', function($scope, $location, $ionicHistory){
   
  $scope.go = function ( path ) {
    $location.path( path );
  };
});

lyricsApp.controller('SongsController', function($scope, $ionicHistory, $state, $cordovaSQLite) {
  
  $scope.albumId = $state.params.albumId;
  $scope.songs = [];
  var qu = "SELECT song_id, song_title, which_album FROM songs WHERE which_album == ?";
  $cordovaSQLite.execute(db, qu, [$scope.albumId]).then(function(r) {
    if(r.rows.length > 0){
      for(var i = 0; i < r.rows.length ; i++){
        $scope.songs.push({song_id: r.rows[i].song_id, song_title: r.rows[i].song_title, song_content: r.rows[i].song_content ,which_album: r.rows[i].which_album});
      }
    }
  }, function(error) {
    console.log(error);
  });
});

lyricsApp.controller('ArtistsController', function($scope, $ionicPlatform, $cordovaSQLite){
  $scope.artists = [];
  $scope.albumSubOption = [];
  $ionicPlatform.ready(function() {
    var query = "SELECT singer_id, singer_name FROM singers";
    var queryTwo = "SELECT album_id, album_title, which_singer FROM albums";
    $cordovaSQLite.execute(db, query, []).then(function(result){
      if(result.rows.length > 0){
        for(i = 0; i < result.rows.length; i++){
          $scope.artists.push({id: result.rows[i].singer_id, name: result.rows[i].singer_name}); 
        }
      }
    }, function(error) {
      console.log(error);
    });

    $cordovaSQLite.execute(db, queryTwo, []).then(function(res){
      if(res.rows.length > 0){
        for(i = 0; i < res.rows.length; i++){
          $scope.albumSubOption.push({album_id: res.rows[i].album_id, album_title: res.rows[i].album_title, which_singer: res.rows[i].which_singer}); 
        }
      }
    }, function(error) {
      console.log(error);
    });

  });

  $scope.toggleGroup = function(artists) {
      if ($scope.isGroupShown(artists)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = artists;
      }
  };

  $scope.isGroupShown = function(artists) {
      return $scope.shownGroup === artists;
  };
   
})