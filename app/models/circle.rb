class Circle < ActiveRecord::Base
	belongs_to :user
	has_many :team_members
	has_many :team_files
	has_many :messages
	has_many :wallpins
end
