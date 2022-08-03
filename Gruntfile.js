module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      ts: {
          default: {
              tsconfig: './tsconfig.json'
          }
      }
  });

  // 加载包含 "uglify" 任务的插件。
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['ts']);

};