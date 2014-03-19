
include_recipe 'apt'

# To get tmux 1.8 and newer vim
apt_repository "pi-rho" do
  uri "http://ppa.launchpad.net/pi-rho/dev/ubuntu"
  distribution "precise"
  components ["main"]
  action :add
  keyserver 'keyserver.ubuntu.com'
  key '779C27D7'
  notifies :run, 'execute[apt-get update]', :immediately
end

%w(tmux vim curl).each do |pkg|
  package pkg
end 

# This module gets pulled in with tmux 1.8 but unfortunately breaks Chef, it
# doesn't seem to be required by tmux though so we can remove it
package 'libpam-tmpdir' do
  action :remove
end

link '/home/vagrant/primero' do
  to '/vagrant'
end

execute_with_ruby 'bundle-install-vagrant' do
  command 'bundle install'
  cwd '/home/vagrant/primero'
  user 'vagrant'
  group 'vagrant'
  rails_env 'development'
end

template "/home/vagrant/primero/config/couchdb.yml" do
  source 'couch_config.yml.erb'
  variables({
    :rails_env => 'development',
    :couchdb_host => node[:primero][:couchdb][:host],
    :couchdb_username => node[:primero][:couchdb][:username],
    :couchdb_password => node[:primero][:couchdb][:password],
  })
  owner 'vagrant'
  group 'vagrant'
end

template "/home/vagrant/primero/config/environments/development.rb" do
  source "rails_env.rb.erb"
  variables({
    :solr_port => 9995
  })
  owner 'vagrant'
  group 'vagrant'
end

execute_bundle 'setup-db-dev' do
  command "rake couchdb:create db:seed db:migrate" 
  cwd '/home/vagrant/primero'
  rails_env 'development'
  user 'vagrant'
  group 'vagrant'
end
