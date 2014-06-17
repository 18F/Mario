require 'capistrano/ext/multistage'
require "rvm/capistrano"

set :stages, %w(development staging production)
set :default_stage, "development"

set :application, "mario"
set :repository,  "https://github.com/18F/Mario.git"

set :branch, ENV['BRANCH'] || 'master'
set :user, "ubuntu"
set :scm, :git
set :deploy_to, "/var/www/#{application}"
set :use_sudo, true


desc "Symlink configs"
 task :symlink_configs, :roles => :app do
   run "ln -nfs #{deploy_to}/shared/configs.js #{release_path}/configs.js"
end

desc "Symlink configs"
 task :install_npm_packages, :roles => :app do
   run "cd #{release_path};npm install"
end

after "deploy:update_code", "symlink_configs"
after "deploy:update_code", "install_npm_packages"
