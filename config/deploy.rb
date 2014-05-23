require "bundler/capistrano"
require "rvm/capistrano"


set :application, "mario"
set :repository,  "https://github.com/18F/Mario.git"
set :domain, '54.185.133.124'
set :branch, ENV['BRANCH'] || 'master'
set :user, "ubuntu"
set :scm, :git
set :deploy_to, "/var/www/#{application}"
set :use_sudo, true


role :app, "54.185.133.124"



