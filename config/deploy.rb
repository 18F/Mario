require 'capistrano/ext/multistage'
require "bundler/capistrano"

set :stages, %w(development staging production)
set :default_stage, "development"
require "rvm/capistrano"

set :application, "mario"
set :repository,  "https://github.com/18F/Mario.git"
set :rails_env, :production
set :branch, ENV['BRANCH'] || 'master'
set :deploy_to, "/var/www/#{application}"
set :user, "ubuntu"
set :rvm_type, :user
set :keep_releases, 6
set :rvm_ruby_string, "2.1.1"
set :scm, :git
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
